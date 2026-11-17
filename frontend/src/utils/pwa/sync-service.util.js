/**
 * @fileoverview PWA sync service
 * Orchestrates data synchronization between the server and IndexedDB.
 * Handles the first-time data load, incremental delta sync, and deletion
 * reconciliation for songs and albums.
 */

import {
  getAllSongs,
  getSongsSince,
  getAllSongIds,
} from "../api/songs-api.util";
import {
  getAllAlbums,
  getAlbumsSince,
  getAllAlbumIds,
} from "../api/album-api.util";
import { songIdbService } from "../db/song-idb-service.util";
import { albumIdbService } from "../db/album-idb-service.util";
import { audioIdbService } from "../db/audio-idb-service.util";
import { syncMetaIdbService } from "../db/sync-meta-idb-service.util";

/**
 * Keys stored in the syncMeta object store.
 * Exported so the service worker registration utility reads the same cursors
 * instead of redeclaring them.
 * @type {Object}
 */
export const SYNC_META_KEYS = {
  LAST_SONG_SYNC: "lastSongSync",
  LAST_ALBUM_SYNC: "lastAlbumSync",
  LAST_FULL_SYNC: "lastFullSync",
};

const { LAST_SONG_SYNC, LAST_ALBUM_SYNC, LAST_FULL_SYNC } = SYNC_META_KEYS;

/**
 * Computes the maximum valid updatedAt across a batch of records
 *
 * Records without a parseable updatedAt are ignored so they can never
 * pull the sync cursor backwards (e.g. to epoch 1970).
 *
 * @param {Array<Object>} records - Batch of synced records
 * @returns {string|null} ISO timestamp of the newest valid record, or null if none have a valid updatedAt
 */
const computeMaxUpdatedAt = (records) => {
  let max = null;
  for (const record of records) {
    const date = new Date(record.updatedAt);
    if (isNaN(date.getTime())) continue;
    if (!max || date > max) max = date;
  }
  return max ? max.toISOString() : null;
};

/**
 * Performs the first-time PWA data load
 *
 * Fetches all songs and albums from the server, stores them in IndexedDB,
 * sets initial sync timestamps based on max updatedAt values, and records
 * the full-sync marker so the next start uses delta sync.
 *
 * @returns {Promise<{songsSynced: number, albumsSynced: number}>} Counts of stored records
 * @throws {Error} If any network or database operation fails
 */
const runInitialSync = async () => {
  const [songResponse, albums] = await Promise.all([
    getAllSongs(),
    getAllAlbums(),
  ]);
  const songs = songResponse.songs || songResponse;

  await songIdbService.bulkPut(songs);
  await albumIdbService.bulkPut(albums);

  const maxSongUpdatedAt = await songIdbService.getMaxUpdatedAt();
  const maxAlbumUpdatedAt = await albumIdbService.getMaxUpdatedAt();

  if (maxSongUpdatedAt) {
    await syncMetaIdbService.set(LAST_SONG_SYNC, maxSongUpdatedAt);
  }
  if (maxAlbumUpdatedAt) {
    await syncMetaIdbService.set(LAST_ALBUM_SYNC, maxAlbumUpdatedAt);
  }

  // Marks the catalog as loaded so later starts take the delta path (with
  // deletion reconciliation) instead of downloading everything again.
  await syncMetaIdbService.set(LAST_FULL_SYNC, new Date().toISOString());

  return { songsSynced: songs.length, albumsSynced: albums.length };
};

/**
 * In-flight guard for the initial sync.
 * Delta sync for songs and albums both fall back to the initial load when
 * their cursor is missing; without this guard they would fetch the full
 * collection twice, concurrently.
 * @type {Promise<{songsSynced: number, albumsSynced: number}>|null}
 */
let initializePromise = null;

/**
 * First-time PWA data setup
 * Concurrent callers share a single in-flight request.
 *
 * @returns {Promise<{songsSynced: number, albumsSynced: number}>} Counts of stored records
 * @throws {Error} If network or database operations fail
 */
export const initializePwaData = () => {
  if (!initializePromise) {
    initializePromise = runInitialSync().finally(() => {
      initializePromise = null;
    });
  }
  return initializePromise;
};

/**
 * Syncs songs since the last sync timestamp
 * Reads lastSongSync from syncMeta, fetches only changed songs,
 * upserts them into IndexedDB, and updates the sync timestamp
 *
 * @returns {Promise<number>} Count of synced songs
 * @throws {Error} If network or database operations fail
 */
export const syncSongs = async () => {
  const lastSync = await syncMetaIdbService.get(LAST_SONG_SYNC);
  if (!lastSync) {
    const initialized = await initializePwaData();
    return initialized.songsSynced;
  }

  const response = await getSongsSince(lastSync);
  const songs = response.songs || response;

  if (songs.length > 0) {
    await songIdbService.bulkPut(songs);

    // Records missing a valid updatedAt still get upserted (they arrived
    // because the backend considered them changed), but they must never
    // pull the sync cursor backwards.
    const maxUpdatedAt = computeMaxUpdatedAt(songs);
    if (maxUpdatedAt) {
      await syncMetaIdbService.set(LAST_SONG_SYNC, maxUpdatedAt);
    }
  }

  return songs.length;
};

/**
 * Syncs albums since the last sync timestamp
 * Reads lastAlbumSync from syncMeta, fetches only changed albums,
 * upserts them into IndexedDB, and updates the sync timestamp
 *
 * @returns {Promise<number>} Count of synced albums
 * @throws {Error} If network or database operations fail
 */
export const syncAlbums = async () => {
  const lastSync = await syncMetaIdbService.get(LAST_ALBUM_SYNC);
  if (!lastSync) {
    const initialized = await initializePwaData();
    return initialized.albumsSynced;
  }

  const albums = await getAlbumsSince(lastSync);

  if (albums.length > 0) {
    await albumIdbService.bulkPut(albums);

    // Same guard as songs: records without a valid updatedAt must never
    // pull the sync cursor backwards.
    const maxUpdatedAt = computeMaxUpdatedAt(albums);
    if (maxUpdatedAt) {
      await syncMetaIdbService.set(LAST_ALBUM_SYNC, maxUpdatedAt);
    }
  }

  return albums.length;
};

/**
 * Removes local songs and albums that no longer exist on the server
 *
 * Delta sync cannot detect hard deletes: a deleted record never reappears in
 * the `syncSince` window, so the local copy would otherwise live forever.
 * Cached audio for removed songs is dropped too, since it becomes unreachable.
 *
 * Refuses to delete anything when the server reports zero ids, so a failed or
 * genuinely empty response can never wipe the local cache.
 *
 * @returns {Promise<{songsRemoved: number, albumsRemoved: number}>} Counts of removed records
 * @throws {Error} If the id lookups fail
 */
export const reconcileDeletions = async () => {
  const [songIds, albumIds] = await Promise.all([
    getAllSongIds(),
    getAllAlbumIds(),
  ]);

  let songsRemoved = 0;
  let albumsRemoved = 0;

  if (Array.isArray(songIds) && songIds.length > 0) {
    const remoteSongIds = new Set(songIds);
    const localSongs = await songIdbService.getAll();

    for (const song of localSongs) {
      if (!song?._id || remoteSongIds.has(song._id)) continue;
      await songIdbService.deleteById(song._id);
      songsRemoved += 1;
      try {
        await audioIdbService.delete(song._id);
      } catch (error) {
        console.warn("Could not drop cached audio for removed song:", error);
      }
    }
  }

  if (Array.isArray(albumIds) && albumIds.length > 0) {
    const remoteAlbumIds = new Set(albumIds);
    const localAlbums = await albumIdbService.getAll();

    for (const album of localAlbums) {
      if (!album?._id || remoteAlbumIds.has(album._id)) continue;
      await albumIdbService.deleteById(album._id);
      albumsRemoved += 1;
    }
  }

  return { songsRemoved, albumsRemoved };
};

/**
 * Syncs both songs and albums in parallel
 * Uses Promise.allSettled so one resource failing does not discard the
 * successful half. Per-resource results are returned; the function only
 * throws when BOTH resources fail.
 *
 * Deletion reconciliation runs only after both delta syncs succeed, because
 * it needs a trustworthy view of the server's id list.
 *
 * @returns {Promise<{songsSynced: number, albumsSynced: number, songsRemoved: number, albumsRemoved: number}>} Counts of synced and removed records
 * @throws {Error} If both songs and albums sync fail
 */
export const syncAll = async () => {
  const results = await Promise.allSettled([syncSongs(), syncAlbums()]);
  const [songsResult, albumsResult] = results;

  let songsSynced = 0;
  let albumsSynced = 0;
  const errors = [];

  if (songsResult.status === "fulfilled") {
    songsSynced = songsResult.value;
  } else {
    errors.push(songsResult.reason?.message || "songs sync failed");
  }

  if (albumsResult.status === "fulfilled") {
    albumsSynced = albumsResult.value;
  } else {
    errors.push(albumsResult.reason?.message || "albums sync failed");
  }

  if (errors.length === 2) {
    throw new Error(
      `Sync failed: songs (${errors[0]}), albums (${errors[1]})`
    );
  }

  if (errors.length === 1) {
    console.warn(
      `Partial sync failure (${errors.join("; ")}); ` +
        "the other resource committed successfully."
    );
  }

  let songsRemoved = 0;
  let albumsRemoved = 0;

  if (errors.length === 0) {
    const reconciled = await reconcileDeletions();
    songsRemoved = reconciled.songsRemoved;
    albumsRemoved = reconciled.albumsRemoved;
  }

  await syncMetaIdbService.set(LAST_FULL_SYNC, new Date().toISOString());

  return { songsSynced, albumsSynced, songsRemoved, albumsRemoved };
};

/**
 * Reads the timestamp of the last completed sync of any kind
 *
 * @returns {Promise<string|null>} ISO timestamp of the last successful sync, or null
 * @throws {Error} If the database read fails
 */
export const getLastFullSyncTime = () => syncMetaIdbService.get(LAST_FULL_SYNC);

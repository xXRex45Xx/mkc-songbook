/**
 * @fileoverview PWA sync service
 * Orchestrates data synchronization between the server and IndexedDB
 * Handles initial data load and incremental delta sync for songs and albums
 */

import { getAllSongs, getSongsSince } from "../api/songs-api.util";
import { getAllAlbums, getAlbumsSince } from "../api/album-api.util";
import { songIdbService } from "../db/song-idb-service.util";
import { albumIdbService } from "../db/album-idb-service.util";
import { syncMetaIdbService } from "../db/sync-meta-idb-service.util";

const LAST_SONG_SYNC_KEY = "lastSongSync";
const LAST_ALBUM_SYNC_KEY = "lastAlbumSync";

/**
 * First-time PWA data setup
 * Fetches all songs and albums from the server, stores them in IndexedDB,
 * and sets initial sync timestamps based on max updatedAt values
 *
 * @returns {Promise<void>}
 * @throws {Error} If database operations fail
 */
export const initializePwaData = async () => {
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
    await syncMetaIdbService.set(LAST_SONG_SYNC_KEY, maxSongUpdatedAt);
  }
  if (maxAlbumUpdatedAt) {
    await syncMetaIdbService.set(LAST_ALBUM_SYNC_KEY, maxAlbumUpdatedAt);
  }
};

/**
 * Syncs songs since the last sync timestamp
 * Reads lastSongSync from syncMeta, fetches only changed songs,
 * upserts them into IndexedDB, and updates the sync timestamp
 *
 * @returns {Promise<number>} Count of synced songs
 * @throws {Error} If database operations fail
 */
export const syncSongs = async () => {
  const lastSync = await syncMetaIdbService.get(LAST_SONG_SYNC_KEY);
  if (!lastSync) {
    await initializePwaData();
    const songs = await songIdbService.getAll();
    return songs.length;
  }

  const response = await getSongsSince(lastSync);
  const songs = response.songs || response;

  if (songs.length > 0) {
    await songIdbService.bulkPut(songs);

    const maxUpdatedAt = songs.reduce((max, song) => {
      const updated = new Date(song.updatedAt);
      return updated > max ? updated : max;
    }, new Date(0));

    await syncMetaIdbService.set(
      LAST_SONG_SYNC_KEY,
      maxUpdatedAt.toISOString()
    );
  }

  return songs.length;
};

/**
 * Syncs albums since the last sync timestamp
 * Reads lastAlbumSync from syncMeta, fetches only changed albums,
 * upserts them into IndexedDB, and updates the sync timestamp
 *
 * @returns {Promise<number>} Count of synced albums
 * @throws {Error} If database operations fail
 */
export const syncAlbums = async () => {
  const lastSync = await syncMetaIdbService.get(LAST_ALBUM_SYNC_KEY);
  if (!lastSync) {
    await initializePwaData();
    const albums = await albumIdbService.getAll();
    return albums.length;
  }

  const albums = await getAlbumsSince(lastSync);

  if (albums.length > 0) {
    await albumIdbService.bulkPut(albums);

    const maxUpdatedAt = albums.reduce((max, album) => {
      const updated = new Date(album.updatedAt);
      return updated > max ? updated : max;
    }, new Date(0));

    await syncMetaIdbService.set(
      LAST_ALBUM_SYNC_KEY,
      maxUpdatedAt.toISOString()
    );
  }

  return albums.length;
};

/**
 * Syncs both songs and albums in parallel
 *
 * @returns {Promise<{songsSynced: number, albumsSynced: number}>} Counts of synced records
 * @throws {Error} If database operations fail
 */
export const syncAll = async () => {
  const [songsSynced, albumsSynced] = await Promise.all([
    syncSongs(),
    syncAlbums(),
  ]);
  return { songsSynced, albumsSynced };
};
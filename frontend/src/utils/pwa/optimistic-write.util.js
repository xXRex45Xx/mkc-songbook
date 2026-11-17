/**
 * @fileoverview Optimistic local copies for queued writes
 *
 * A write made offline reaches the server only on replay. These helpers read the version of
 * a record the device last saw (sent with the replay so the server can refuse a stale edit)
 * and apply the queued change to the local copy right away, so offline pages show it.
 * Every helper is best-effort: a failure here never blocks the queue.
 */

import songIdbService from "../db/song-idb-service.util";
import albumIdbService from "../db/album-idb-service.util";
import userIdbService from "../db/user-idb-service.util";

const PLAYLIST_CACHE = "api-playlists";

const RESOURCE_PATTERN = /\/api\/(song|album|playlist)\/([^/?#]+)\/?(?:\?.*)?$/;

/**
 * Splits a request URL into the kind and id of the record it targets.
 *
 * @param {string} url - Request URL
 * @returns {{kind: "song"|"album"|"playlist", id: string}|null} Target record, or null for other URLs
 */
export const parseResource = (url) => {
  const match = RESOURCE_PATTERN.exec(url);
  return match ? { kind: match[1], id: decodeURIComponent(match[2]) } : null;
};

const entriesOf = (body) => (body?.kind === "formData" ? body.entries : []);

const textField = (body, name) => {
  const entry = entriesOf(body).find(([key]) => key === name);
  return entry ? String(entry[1]) : undefined;
};

const jsonOf = (body) => {
  if (body?.kind !== "text") return {};
  try {
    return JSON.parse(body.value) || {};
  } catch {
    return {};
  }
};

const readPlaylistCache = async (id) => {
  if (typeof caches === "undefined") return null;
  const cache = await caches.open(PLAYLIST_CACHE);
  const keys = await cache.keys();
  const key = keys.find((request) => parseResource(request.url)?.id === id);
  if (!key) return null;
  const response = await cache.match(key);
  return response ? { cache, key, data: await response.json() } : null;
};

/**
 * Reads the `updatedAt` of the local copy of the record a write targets.
 *
 * @param {string} url - Request URL of the write
 * @returns {Promise<string|null>} ISO-like timestamp, or null when no local copy exists
 */
export const readBaseUpdatedAt = async (url) => {
  try {
    const target = parseResource(url);
    if (!target) return null;

    let record = null;
    if (target.kind === "song") record = await songIdbService.getById(target.id);
    else if (target.kind === "album") record = await albumIdbService.getById(target.id);
    else record = (await readPlaylistCache(target.id))?.data;

    return record?.updatedAt ? new Date(record.updatedAt).toISOString() : null;
  } catch {
    return null;
  }
};

const applySongWrite = async (target, method, body) => {
  if (method === "DELETE") return songIdbService.deleteById(target.id);

  const existing = await songIdbService.getById(target.id);
  if (!existing) return;

  const patch = {};
  const title = textField(body, "title");
  const lyrics = textField(body, "lyrics");
  if (title !== undefined) patch.title = title;
  if (lyrics !== undefined) patch.lyrics = lyrics;
  if (method === "PUT") {
    patch.youtubeLink = textField(body, "video-link") ?? null;
    patch.musicElements = {
      ...existing.musicElements,
      chord: textField(body, "chord"),
      tempo: Number(textField(body, "tempo")) || undefined,
      rythm: textField(body, "rythm"),
    };
  } else if (textField(body, "video-link") !== undefined) {
    patch.youtubeLink = textField(body, "video-link");
  }
  if (entriesOf(body).some(([key]) => key === "audio-file")) patch.hasAudio = true;

  const newId = textField(body, "id");
  await songIdbService.bulkPut([{ ...existing, ...patch, _id: newId || existing._id }]);
  if (newId && newId !== existing._id) await songIdbService.deleteById(existing._id);
};

const applyAlbumWrite = async (target, method, body) => {
  if (method === "DELETE") return albumIdbService.deleteById(target.id);

  const existing = await albumIdbService.getById(target.id);
  if (!existing) return;

  const title = textField(body, "title");
  const newId = textField(body, "id");
  await albumIdbService.bulkPut([
    { ...existing, name: title ?? existing.name, _id: newId || existing._id },
  ]);
  if (newId && newId !== existing._id) await albumIdbService.deleteById(existing._id);
};

const applyPlaylistWrite = async (target, method, body) => {
  const cached = await readPlaylistCache(target.id);
  if (!cached) return;
  const { cache, key, data } = cached;

  if (method === "DELETE") return cache.delete(key);

  const change = jsonOf(body);
  const next = { ...data };
  if (change.name !== undefined) next.name = change.name;
  if (change.visibility) next.visibility = change.visibility;

  const wanted =
    method === "PUT"
      ? change.songs
      : (data.songs || [])
          .map((song) => song._id)
          .filter((id) => !(change.removeSongs || []).includes(id))
          .concat(change.addSongs || []);

  if (wanted) {
    const known = new Map((data.songs || []).map((song) => [song._id, song]));
    const songs = [];
    for (const id of wanted) {
      const song = known.get(id) ?? (await songIdbService.getById(id));
      if (song) songs.push({ ...song, hasAudio: Boolean(song.hasAudio) });
    }
    next.songs = songs;
  }

  await cache.put(
    key,
    new Response(JSON.stringify(next), { headers: { "Content-Type": "application/json" } })
  );
};

const applyFavoritesWrite = async (body) => {
  const user = await userIdbService.get();
  if (!user) return;

  const change = jsonOf(body);
  let favorites = change.favorites ?? user.favorites ?? [];
  favorites = favorites.filter((id) => !(change.removeSongs || []).includes(id));
  for (const id of change.addSongs || []) if (!favorites.includes(id)) favorites.push(id);

  await userIdbService.put({ ...user, favorites });
};

/**
 * Applies a queued write to the local copy of the record it targets, so pages read offline
 * show the edit before the queue replays. The local `updatedAt` is left alone: the next sync
 * after a replay must still see the server copy as newer and replace this one.
 *
 * @param {{url: string, method: string, body: Object|null}} write - Queued request; `body` is the serialized form from the write queue
 * @returns {Promise<void>} Resolves when the local copy is updated; never rejects
 */
export const applyOptimisticWrite = async ({ url, method, body }) => {
  try {
    if (/\/api\/user\/update-favorites/.test(url)) return await applyFavoritesWrite(body);

    const target = parseResource(url);
    if (!target) return;

    if (target.kind === "song") await applySongWrite(target, method, body);
    else if (target.kind === "album") await applyAlbumWrite(target, method, body);
    else await applyPlaylistWrite(target, method, body);
  } catch (error) {
    console.error("Could not update the local copy of a queued edit.", error);
  }
};

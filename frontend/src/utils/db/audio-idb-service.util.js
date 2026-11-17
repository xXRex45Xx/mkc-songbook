/**
 * @fileoverview Audio IndexedDB service
 * Provides storage operations for audio Blob files in IndexedDB
 * Used by PWA offline audio playback feature
 */

import { getDB } from "./indexed-db.util";

const STORE_NAME = "audioFiles";

/**
 * Audio IndexedDB service
 * Handles storage and retrieval of audio Blobs for offline playback
 *
 * @type {Object}
 */
export const audioIdbService = {
  /**
   * Stores an audio Blob for a song
   *
   * Accepts either (songId, blob) or a full record object for backward
   * compatibility. When a record object is passed it must include _id/songId.
   *
   * @param {string|Object} songIdOrRecord - Song identifier or full record
   * @param {Blob} [blob] - Audio Blob to store (ignored when record passed)
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async store(songIdOrRecord, blob) {
    const db = await getDB();
    if (typeof songIdOrRecord === "object" && songIdOrRecord !== null) {
      const record = songIdOrRecord;
      await db.put(STORE_NAME, {
        _id: record._id || record.songId,
        songId: record.songId || record._id,
        blob: record.blob,
        updatedAt: record.updatedAt,
        size: record.size,
        mimeType: record.mimeType,
      });
    } else {
      await db.put(STORE_NAME, {
        _id: songIdOrRecord,
        songId: songIdOrRecord,
        blob,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  /**
   * Retrieves an audio Blob for a song
   *
   * @param {string} songId - Song identifier
   * @returns {Promise<Blob|null>} Audio Blob or null if not cached
   * @throws {Error} If database operation fails
   */
  async get(songId) {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, songId);
    return entry ? entry.blob : null;
  },

  /**
   * Removes a cached audio file for a song
   *
   * @param {string} songId - Song identifier
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async delete(songId) {
    const db = await getDB();
    await db.delete(STORE_NAME, songId);
  },

  /**
   * Checks whether an audio file is cached for a song
   *
   * @param {string} songId - Song identifier
   * @returns {Promise<boolean>} True if audio is cached
   * @throws {Error} If database operation fails
   */
  async exists(songId) {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, songId);
    return !!entry;
  },

  /**
   * Retrieves a cached audio file for a song along with its metadata
   *
   * @param {string} songId - Song identifier
   * @returns {Promise<Object|null>} Object with {_id, songId, blob, updatedAt, size, mimeType} or null
   * @throws {Error} If database operation fails
   */
  async getWithMeta(songId) {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, songId);
    if (!entry) return null;
    return {
      _id: entry._id,
      songId: entry.songId || entry._id,
      blob: entry.blob,
      updatedAt: entry.updatedAt || null,
      size: typeof entry.size === "number" ? entry.size : null,
      mimeType: entry.mimeType || "",
    };
  },

  /**
   * Retrieves metadata for all cached audio files
   *
   * @returns {Promise<Array<Object>>} Array of metadata objects
   * @throws {Error} If database operation fails
   */
  async getAllMeta() {
    const db = await getDB();
    const entries = await db.getAll(STORE_NAME);
    return entries.map((entry) => ({
      _id: entry._id,
      songId: entry.songId || entry._id,
      blob: entry.blob,
      updatedAt: entry.updatedAt || null,
      size: typeof entry.size === "number" ? entry.size : null,
      mimeType: entry.mimeType || "",
    }));
  },

  /**
   * Returns all song IDs that have cached audio files
   *
   * @returns {Promise<string[]>} Array of song IDs with cached audio
   * @throws {Error} If database operation fails
   */
  async getAllIds() {
    const db = await getDB();
    const allKeys = await db.getAllKeys(STORE_NAME);
    return allKeys;
  },
};

export default audioIdbService;

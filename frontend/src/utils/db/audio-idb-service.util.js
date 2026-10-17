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
   * @param {string} songId - Song identifier
   * @param {Blob} blob - Audio Blob to store
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async store(songId, blob) {
    const db = await getDB();
    await db.put(STORE_NAME, { _id: songId, blob });
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

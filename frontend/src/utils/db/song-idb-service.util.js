/**
 * @fileoverview Song IndexedDB service
 * Provides CRUD operations for local song storage in IndexedDB
 * Used by PWA sync services for offline song data access
 */

import { getDB } from "./indexed-db.util";

const STORE_NAME = "songs";

/**
 * Song IndexedDB service
 * Handles all song-related operations in browser IndexedDB storage
 *
 * @type {Object}
 */
export const songIdbService = {
  /**
   * Retrieves all songs from IndexedDB
   *
   * @returns {Promise<Array>} Array of song objects
   * @throws {Error} If database operation fails
   */
  async getAll() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  /**
   * Retrieves a single song by ID
   *
   * @param {string} id - Song ID
   * @returns {Promise<Object|null>} Song object or null if not found
   * @throws {Error} If database operation fails
   */
  async getById(id) {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  /**
   * Upserts an array of songs into IndexedDB
   *
   * @param {Array} songs - Array of song objects to upsert
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async bulkPut(songs) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const song of songs) {
      tx.store.put(song);
    }
    await tx.done;
  },

  /**
   * Removes a song by ID from IndexedDB
   *
   * @param {string} id - Song ID
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async deleteById(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  /**
   * Returns the maximum updatedAt value across all stored songs
   *
   * @returns {Promise<string|null>} ISO timestamp of most recent song, or null if no songs
   * @throws {Error} If database operation fails
   */
  async getMaxUpdatedAt() {
    const db = await getDB();
    const songs = await db.getAll(STORE_NAME);
    if (!songs || songs.length === 0) return null;
    const maxDate = songs.reduce((max, song) => {
      const updated = new Date(song.updatedAt);
      return updated > max ? updated : max;
    }, new Date(0));
    return maxDate.toISOString();
  },
};

export default songIdbService;

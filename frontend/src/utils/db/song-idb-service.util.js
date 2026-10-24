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
   * Writes in batches of 50 so a single transaction cannot be aborted by
   * the quota limit when the catalog is large. Each batch commits before
   * the next starts, so partial progress is retained.
   *
   * @param {Array} songs - Array of song objects to upsert
   * @param {number} [batchSize=50] - Songs per transaction
   * @returns {Promise<void>}
   * @throws {Error} If a database operation fails
   */
  async bulkPut(songs, batchSize = 50) {
    const db = await getDB();
    for (let i = 0; i < songs.length; i += batchSize) {
      const batch = songs.slice(i, i + batchSize);
      const tx = db.transaction(STORE_NAME, "readwrite");
      for (const song of batch) {
        tx.store.put(song);
      }
      await tx.done;
    }
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
   * Uses the updatedAt index in descending order and stops at the first
   * record, so it reads a single entry instead of scanning the whole store
   * (including full lyrics) on every sync.
   *
   * @returns {Promise<string|null>} ISO timestamp of most recent song, or null if no songs
   * @throws {Error} If database operation fails
   */
  async getMaxUpdatedAt() {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.store.index("updatedAt");
    let max = null;
    let cursor = await index.openCursor(null, "prev");
    while (cursor) {
      const updated = new Date(cursor.value.updatedAt);
      if (!isNaN(updated.getTime())) {
        max = updated;
        break;
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    return max ? max.toISOString() : null;
  },
};

export default songIdbService;

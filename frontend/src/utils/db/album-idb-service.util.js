/**
 * @fileoverview Album IndexedDB service
 * Provides CRUD operations for local album storage in IndexedDB
 * Used by PWA sync services for offline album data access
 */

import { getDB } from "./indexed-db.util";

const STORE_NAME = "albums";

/**
 * Album IndexedDB service
 * Handles all album-related operations in browser IndexedDB storage
 *
 * @type {Object}
 */
export const albumIdbService = {
  /**
   * Retrieves all albums from IndexedDB
   *
   * @returns {Promise<Array>} Array of album objects
   * @throws {Error} If database operation fails
   */
  async getAll() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  /**
   * Retrieves a single album by ID
   *
   * @param {string} id - Album ID
   * @returns {Promise<Object|null>} Album object or null if not found
   * @throws {Error} If database operation fails
   */
  async getById(id) {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  /**
   * Upserts an array of albums into IndexedDB
   *
   * Writes in batches of 50 so a single transaction cannot be aborted by
   * the quota limit when the catalog is large.
   *
   * @param {Array} albums - Array of album objects to upsert
   * @param {number} [batchSize=50] - Albums per transaction
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async bulkPut(albums, batchSize = 50) {
    const db = await getDB();
    for (let i = 0; i < albums.length; i += batchSize) {
      const batch = albums.slice(i, i + batchSize);
      const tx = db.transaction(STORE_NAME, "readwrite");
      for (const album of batch) {
        tx.store.put(album);
      }
      await tx.done;
    }
  },

  /**
   * Removes an album by ID from IndexedDB
   *
   * @param {string} id - Album ID
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async deleteById(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  /**
   * Returns the maximum updatedAt value across all stored albums
   *
   * Uses the updatedAt index in descending order and stops at the first
   * record, so it reads a single entry instead of scanning the whole store
   * on every sync.
   *
   * @returns {Promise<string|null>} ISO timestamp of most recent album, or null if no albums
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

export default albumIdbService;

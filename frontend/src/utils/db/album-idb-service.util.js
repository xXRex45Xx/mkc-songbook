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
   * @param {Array} albums - Array of album objects to upsert
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async bulkPut(albums) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const album of albums) {
      tx.store.put(album);
    }
    await tx.done;
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
   * @returns {Promise<string|null>} ISO timestamp of most recent album, or null if no albums
   * @throws {Error} If database operation fails
   */
  async getMaxUpdatedAt() {
    const db = await getDB();
    const albums = await db.getAll(STORE_NAME);
    if (!albums || albums.length === 0) return null;
    const maxDate = albums.reduce((max, album) => {
      const updated = new Date(album.updatedAt);
      return updated > max ? updated : max;
    }, new Date(0));
    return maxDate.toISOString();
  },
};

export default albumIdbService;

/**
 * @fileoverview Sync metadata IndexedDB service
 * Provides key-value storage for sync timestamps in IndexedDB
 * Used by PWA sync services to track last sync times
 */

import { getDB } from "./indexed-db.util";

const STORE_NAME = "syncMeta";

/**
 * Sync metadata IndexedDB service
 * Simple key-value store for sync timestamps
 *
 * @type {Object}
 */
export const syncMetaIdbService = {
  /**
   * Retrieves a sync metadata value by key
   *
   * @param {string} key - Metadata key (e.g., "lastSongSync", "lastAlbumSync")
   * @returns {Promise<string|null>} Stored value or null if not found
   * @throws {Error} If database operation fails
   */
  async get(key) {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, key);
    return entry ? entry.value : null;
  },

  /**
   * Stores a sync metadata value
   *
   * @param {string} key - Metadata key (e.g., "lastSongSync", "lastAlbumSync")
   * @param {string} value - ISO timestamp string to store
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async set(key, value) {
    const db = await getDB();
    await db.put(STORE_NAME, { key, value });
  },
};

export default syncMetaIdbService;

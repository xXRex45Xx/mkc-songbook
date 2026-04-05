/**
 * @fileoverview IndexedDB database utility
 * Provides database connection and schema management for browser-based persistence
 * Used by PWA services to store data locally in IndexedDB
 */

import { openDB } from "idb";

/**
 * Database name for IndexedDB storage
 * @type {string}
 */
const DB_NAME = "mkc-songbook-db";

/**
 * Database version for IndexedDB schema migrations
 * @type {number}
 */
const DB_VERSION = 1;

/**
 * Schema definitions for all IndexedDB object stores
 * Add new store schemas here for future PWA features
 * @type {Object.<string, Object>}
 */
const STORE_SCHEMAS = {
  localPlaylists: {
    keyPath: "id",
    indexes: [
      { name: "synced", keyPath: "synced" },
      { name: "createdAt", keyPath: "createdAt" },
      { name: "remoteId", keyPath: "remoteId" },
    ],
  },
};

let dbPromise = null;

/**
 * Gets or creates the IndexedDB database connection
 * Initializes all object stores defined in STORE_SCHEMAS on first connection
 *
 * @returns {Promise<IDBDatabase>} Open IndexedDB database instance
 * @example
 * ```javascript
 * const db = await getDB();
 * const playlists = await db.getAll('localPlaylists');
 * ```
 */
const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const storesToCreate = Object.keys(STORE_SCHEMAS);

        for (const storeName of storesToCreate) {
          if (db.objectStoreNames.contains(storeName)) continue;
          const schema = STORE_SCHEMAS[storeName];
          const store = db.createObjectStore(storeName, {
            keyPath: schema.keyPath,
          });

          if (schema.indexes) {
            for (const index of schema.indexes) {
              store.createIndex(index.name, index.keyPath);
            }
          }
        }
      },
    });
  }
  return dbPromise;
};

export { getDB, DB_NAME, DB_VERSION, STORE_SCHEMAS };
export default getDB;

/**
 * @fileoverview IndexedDB database utility
 * Provides database connection and schema management for browser-based persistence
 * Used by PWA services to store data locally in IndexedDB
 */

import { openDB, deleteDB } from "idb";

/**
 * Database name for IndexedDB storage
 * @type {string}
 */
const DB_NAME = "mkc-songbook-db";

/**
 * Database version for IndexedDB schema migrations
 * @type {number}
 */
const DB_VERSION = 4;

/**
 * Default timestamp used for audioFiles records migrated from older schemas
 * whose original updatedAt is unknown. Null marks "unknown" explicitly.
 * @type {null}
 */
const UNKNOWN_UPDATED_AT = null;

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
  songs: {
    keyPath: "_id",
    indexes: [
      { name: "updatedAt", keyPath: "updatedAt" },
      { name: "hasAudio", keyPath: "hasAudio" },
      { name: "title", keyPath: "title" },
      { name: "createdAt", keyPath: "createdAt" },
    ],
  },
  albums: {
    keyPath: "_id",
    indexes: [
      { name: "updatedAt", keyPath: "updatedAt" },
      { name: "name", keyPath: "name" },
    ],
  },
  syncMeta: {
    keyPath: "key",
  },
  settings: {
    keyPath: "key",
  },
  users: {
    keyPath: "_id",
  },
  audioFiles: {
    keyPath: "_id",
    indexes: [
      { name: "songId", keyPath: "songId" },
      { name: "updatedAt", keyPath: "updatedAt" },
    ],
  },
  pendingWrites: {
    keyPath: "id",
    indexes: [{ name: "createdAt", keyPath: "createdAt" }],
  },
};

let dbPromise = null;

/**
 * Creates an object store with all of its indexes
 *
 * @param {IDBDatabase} db - Wrapped database inside the upgrade callback
 * @param {string} storeName - Name of the store to create
 * @param {Object} schema - Schema definition ({ keyPath, indexes })
 * @returns {void}
 * @private
 */
const createStoreWithIndexes = (db, storeName, schema) => {
  const store = db.createObjectStore(storeName, { keyPath: schema.keyPath });
  for (const index of schema.indexes || []) {
    store.createIndex(index.name, index.keyPath);
  }
};

/**
 * Backfills audioFiles records during the v2 -> v3 migration.
 * Adds the new songId / updatedAt fields to records written by the old
 * schema ({ _id, blob }) so the new indexes can find them.
 *
 * MUST be called after the new indexes have been created and before any
 * other cursor is opened on the store (an open cursor locks the index set).
 *
 * @param {IDBObjectStore} store - Wrapped audioFiles store from the upgrade transaction
 * @returns {void}
 * @private
 */
const backfillAudioFiles = (store) => {
  const request = store.openCursor();

  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (!cursor) return;

    const value = cursor.value;
    let changed = false;

    if (value.songId === undefined || value.songId === null) {
      value.songId = value._id;
      changed = true;
    }

    if (value.updatedAt === undefined) {
      value.updatedAt = UNKNOWN_UPDATED_AT;
      changed = true;
    }

    if (changed) cursor.update(value);

    cursor.continue();
  };
};

/**
 * Gets or creates the IndexedDB database connection.
 * Initializes every store declared in STORE_SCHEMAS and migrates older
 * versions forward (v1/v2 -> v3) by adding missing stores and indexes
 * without ever dropping existing data.
 *
 * @returns {Promise<IDBDatabase>} Open IndexedDB database instance
 * @throws {Error} If database operation fails
 * @example
 * ```javascript
 * const db = await getDB();
 * const playlists = await db.getAll('localPlaylists');
 * ```
 */
const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      blocked() {
        console.warn(
          "IndexedDB upgrade is blocked by another open tab; close it to continue."
        );
      },
      blocking() {
        // Another tab wants to upgrade the schema. Release our connection so
        // it is not stuck, and let the next call reopen at the new version.
        console.warn("Releasing IndexedDB connection for a pending upgrade.");
        const stale = dbPromise;
        dbPromise = null;
        stale?.then((db) => db.close()).catch(() => {});
      },
      upgrade(db, oldVersion, _newVersion, transaction) {
        for (const storeName of Object.keys(STORE_SCHEMAS)) {
          const schema = STORE_SCHEMAS[storeName];

          if (!db.objectStoreNames.contains(storeName)) {
            createStoreWithIndexes(db, storeName, schema);
            continue;
          }

          // Store already exists: add any index the current schema requires
          // that the stored version is missing. Never drop or recreate data.
          const store = transaction.objectStore(storeName);
          const missingIndexes = (schema.indexes || []).filter(
            (index) => !store.indexNames.contains(index.name)
          );

          // Indexes must exist before the backfill cursor opens, because an
          // open cursor locks the store's index set for createIndex().
          for (const index of missingIndexes) {
            store.createIndex(index.name, index.keyPath);
          }

          // Backfill whenever the store predates v3, even if the indexes were
          // already present, so records written by the old schema still gain
          // the songId/updatedAt fields the new indexes rely on.
          if (storeName === "audioFiles" && oldVersion < 3) {
            backfillAudioFiles(store);
          }
        }
      },
    }).catch((error) => {
      // Reset the cached promise so a later call can retry (or recover via
      // resetDatabase) instead of being stuck with a rejected promise.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
};

/**
 * Deletes the entire IndexedDB database and clears the cached connection.
 * Recovery path for a corrupted database — callers opt in explicitly; the
 * app never auto-deletes. Re-initialize data afterwards (e.g. via
 * initializePwaData()) because all local data is gone.
 *
 * @returns {Promise<void>}
 * @throws {Error} If the database cannot be deleted (e.g. blocked by another tab)
 * @example
 * ```javascript
 * import { resetDatabase } from "./indexed-db.util";
 * await resetDatabase();
 * await initializePwaData();
 * ```
 */
export const resetDatabase = async () => {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch {
      // Connection already broken — nothing to close.
    }
  }
  dbPromise = null;
  await deleteDB(DB_NAME, {
    blocked() {
      console.warn(
        "Database deletion is blocked by another open tab; close it and retry."
      );
    },
  });
};

export { getDB, DB_NAME, DB_VERSION, STORE_SCHEMAS };
export default getDB;

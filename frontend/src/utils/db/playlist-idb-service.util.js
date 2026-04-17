/**
 * @fileoverview Playlist IndexedDB service
 * Provides CRUD operations for local playlist storage in IndexedDB
 */

import { getDB } from "./indexed-db.util";

const STORE_NAME = "localPlaylists";

/**
 * Playlist IndexedDB service
 * Handles all playlist-related operations in browser IndexedDB storage
 *
 * @type {Object}
 */
export const playlistIdbService = {
  /**
   * Retrieves all local playlists from IndexedDB
   *
   * @returns {Promise<Array>} Array of playlist objects
   * @throws {Error} If database operation fails
   * @example
   * ```javascript
   * const playlists = await playlistIdbService.getAll();
   * console.log(`Found ${playlists.length} playlists`);
   * ```
   */
  async getAll() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  /**
   * Retrieves a single local playlist by ID
   *
   * @param {string} id - Playlist ID
   * @returns {Promise<Object|null>} Playlist object or null if not found
   * @throws {Error} If database operation fails
   * @example
   * ```javascript
   * const playlist = await playlistIdbService.getById('local_123');
   * ```
   */
  async getById(id) {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  /**
   * Creates a new local playlist in IndexedDB
   * Generates a local ID with 'local_' prefix for identification
   *
   * @param {Object} playlist - Playlist data
   * @param {string} playlist.name - Playlist name
   * @param {Array} playlist.songs - Array of song objects
   * @returns {Promise<string>} Created playlist ID
   * @throws {Error} If database operation fails
   * @example
   * ```javascript
   * const id = await playlistIdbService.create({
   *   name: 'My Favorites',
   *   songs: [{ _id: 'song1', title: 'Amazing Grace' }]
   * });
   * ```
   */
  async create({ name, songs }) {
    const db = await getDB();
    const id = `local_${crypto.randomUUID()}`;
    const now = new Date();
    const playlist = {
      id,
      name,
      songs: songs || [],
      createdAt: now,
      updatedAt: now,
      synced: false,
      remoteId: null,
    };
    await db.add(STORE_NAME, playlist);
    return id;
  },

  /**
   * Updates an existing local playlist
   *
   * @param {string} id - Playlist ID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.name] - New playlist name
   * @param {Array} [updates.songs] - New songs array
   * @returns {Promise<void>}
   * @throws {Error} If playlist not found or database operation fails
   * @example
   * ```javascript
   * await playlistIdbService.update('local_123', { name: 'Updated Name' });
   * ```
   */
  async update(id, { name, songs }) {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, id);
    if (!existing) throw new Error("Playlist not found");
    const updated = {
      ...existing,
      name: name ?? existing.name,
      songs: songs ?? existing.songs,
      updatedAt: new Date(),
    };
    await db.put(STORE_NAME, updated);
  },

  /**
   * Deletes a local playlist from IndexedDB
   *
   * @param {string} id - Playlist ID
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   * @example
   * ```javascript
   * await playlistIdbService.delete('local_123');
   * ```
   */
  async delete(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  /**
   * Marks a playlist as synced with server after successful upload
   *
   * @param {string} id - Local playlist ID
   * @param {string} remoteId - Server playlist MongoDB _id
   * @returns {Promise<void>}
   * @throws {Error} If playlist not found or database operation fails
   * @example
   * ```javascript
   * await playlistIdbService.markSynced('local_123', '507f1f77bcf86cd799439011');
   * ```
   */
  async markSynced(id, remoteId) {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, id);
    if (!existing) throw new Error("Playlist not found");
    const updated = {
      ...existing,
      synced: true,
      remoteId,
      updatedAt: new Date(),
    };
    await db.put(STORE_NAME, updated);
  },

  /**
   * Retrieves all unsynced playlists (created locally, not uploaded)
   *
   * @returns {Promise<Array>} Array of unsynced playlist objects
   * @throws {Error} If database operation fails
   * @example
   * ```javascript
   * const unsynced = await playlistIdbService.getUnsynced();
   * ```
   */
  async getUnsynced() {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    return all.filter((p) => !p.synced);
  },

  /**
   * Retrieves all synced playlists (uploaded to server)
   *
   * @returns {Promise<Array>} Array of synced playlist objects
   * @throws {Error} If database operation fails
   * @example
   * ```javascript
   * const synced = await playlistIdbService.getSynced();
   * ```
   */
  async getSynced() {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    return all.filter((p) => p.synced);
  },
};

export default playlistIdbService;

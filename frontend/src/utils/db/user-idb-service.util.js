/**
 * @fileoverview User IndexedDB service
 * Provides CRUD operations for the offline user cache in IndexedDB.
 * The users store (keyPath _id) mirrors the shape returned by
 * GET /api/user/current-user: { id, name, email, role, favorites }.
 * The active session is cached under the key "current" so the app can
 * serve a logged-in user while offline.
 */

import { getDB } from "./indexed-db.util";

const STORE_NAME = "users";
const CURRENT_KEY = "current";

/**
 * User IndexedDB service
 * Handles offline user cache operations in browser IndexedDB storage
 *
 * @type {Object}
 */
export const userIdbService = {
  /**
   * Retrieves the cached current user from IndexedDB
   *
   * @returns {Promise<Object|null>} User object ({ id, name, email, role, favorites }) or null if not cached
   * @throws {Error} If database operation fails
   */
  async get() {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, CURRENT_KEY);
    return entry ? entry.user : null;
  },

  /**
   * Stores the current logged-in user in the offline cache
   *
   * @param {Object} user - User object from getCurrentLoggedInUser (data.user)
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async put(user) {
    const db = await getDB();
    await db.put(STORE_NAME, { _id: CURRENT_KEY, user });
  },

  /**
   * Clears the cached current user from IndexedDB
   *
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  async clear() {
    const db = await getDB();
    await db.delete(STORE_NAME, CURRENT_KEY);
  },
};

export default userIdbService;
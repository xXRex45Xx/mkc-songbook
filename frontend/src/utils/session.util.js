/**
 * @fileoverview Client-side session state
 * The session itself is two HttpOnly cookies that page scripts cannot read. This module keeps
 * a non-secret "signed in" hint in localStorage, so the app knows whether to ask the server
 * for the current user, and ends the session on this device.
 *
 * The hint is not a credential: setting it by hand only makes the app send a request that the
 * server answers with 401.
 */

import store from "../store/store";
import {
	resetCurrentUser,
	setAdminType,
	setCurrentUser,
} from "../store/slices/user.slice";
import { userIdbService } from "./db/user-idb-service.util";

const SIGNED_IN_KEY = "mkc:signed-in";

/** Set when a sign-out could not reach the server, so the server call is retried later. */
const LOGOUT_PENDING_KEY = "mkc:logout-pending";

/** Key the pre-cookie login token was stored under. Read only to migrate it away. */
const LEGACY_TOKEN_KEY = "_s";

/** Service worker caches that hold responses made for the signed-in user. */
const USER_CACHES = ["api-user", "api-favorites", "api-playlists"];

/**
 * Reads a localStorage value
 *
 * @param {string} key - Storage key
 * @returns {string|null} The value, or null when absent or when storage is unavailable
 */
const readStorage = (key) => {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
};

/**
 * Writes or removes a localStorage value. When storage is unavailable the write is lost: the
 * hint resets, a pending logout is not retried, and the session ends by expiry.
 *
 * @param {string} key - Storage key
 * @param {string|null} value - New value; null removes the key
 * @returns {void}
 */
const writeStorage = (key, value) => {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {
		// Storage is unavailable; see above.
	}
};

/**
 * Tells whether this browser believes it holds a session
 *
 * @returns {boolean} True when the signed-in hint is set
 */
export const isSignedIn = () => readStorage(SIGNED_IN_KEY) === "1";

/**
 * Reads the pre-cookie login token left in localStorage by an older version of the app
 *
 * @returns {string|null} The legacy token, or null when there is none
 */
export const getLegacyToken = () => readStorage(LEGACY_TOKEN_KEY);

/**
 * Removes the pre-cookie login token from localStorage
 *
 * @returns {void}
 */
export const clearLegacyToken = () => writeStorage(LEGACY_TOKEN_KEY, null);

/**
 * Sets or clears the signed-in hint
 *
 * @param {boolean} signedIn - New value
 * @returns {void}
 */
export const setSignedIn = (signedIn) => writeStorage(SIGNED_IN_KEY, signedIn ? "1" : null);

/**
 * Records that the server was not told about a sign-out, or clears the record
 *
 * @param {boolean} pending - New value
 * @returns {void}
 */
export const setLogoutPending = (pending) =>
	writeStorage(LOGOUT_PENDING_KEY, pending ? "1" : null);

/**
 * Tells whether a sign-out still has to be sent to the server
 *
 * @returns {boolean} True when the server was not reached at sign-out
 */
export const isLogoutPending = () => readStorage(LOGOUT_PENDING_KEY) === "1";

/**
 * Records a successful sign-in: sets the hint, fills the Redux user state, and caches the user
 * for offline reloads. The cookies were already set by the server's response.
 *
 * @param {Object} user - User object from the login, sign-up, or Google response
 * @returns {Promise<void>}
 */
export const startSession = async (user) => {
	setSignedIn(true);
	store.dispatch(setCurrentUser(user));
	store.dispatch(
		setAdminType(["admin", "super-admin"].includes(user.role) ? user.role : null)
	);
	try {
		await userIdbService.put(user);
	} catch (error) {
		console.error("Failed to cache the user:", error);
	}
};

/**
 * Ends the session on this device: clears the hint, the Redux user state, the cached user, and
 * the service worker caches of per-user responses. It does not tell the server; see `logout`
 * in user-api.util.js for that. Safe to call when already signed out.
 *
 * @returns {Promise<void>}
 */
export const endSession = async () => {
	setSignedIn(false);
	store.dispatch(resetCurrentUser());
	store.dispatch(setAdminType(null));

	try {
		await userIdbService.clear();
	} catch (error) {
		console.error("Failed to clear the cached user:", error);
	}

	if (typeof caches === "undefined") return;
	try {
		await Promise.all(USER_CACHES.map((name) => caches.delete(name)));
	} catch (error) {
		console.error("Failed to clear the cached responses:", error);
	}
};

/**
 * Reads the id of the signed-in user, from Redux or, after an offline reload, the cached copy
 *
 * @returns {Promise<string|null>} User id, or null when nobody is signed in
 */
export const getCurrentUserId = async () => {
	const fromStore = store.getState().user.currentUser?.id;
	if (fromStore) return fromStore;

	try {
		return (await userIdbService.get())?.id ?? null;
	} catch {
		return null;
	}
};

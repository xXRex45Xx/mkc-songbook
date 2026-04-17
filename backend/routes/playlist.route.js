/**
 * Playlist Routes Module.
 * Handles all playlist-related routes including creation, listing, updating and deletion.
 * Some routes require authentication and admin privileges.
 * @module routes/playlist
 */

import { Router } from "express";
import passport from "passport";
import { wrapAsync } from "../utils/error.util.js";
import {
	createPlaylist,
	deletePlaylist,
	getAllOrSearchPlaylists,
	getPlaylist,
	updatePlaylist,
	patchPlaylist,
} from "../controllers/playlist.controller.js";
import { checkSongExists } from "../middlewares/pre-add-album.middleware.js";
import {
	validateCreatePlaylist,
	validateGetAllPlaylists,
	validateGetPlaylist,
	validateUpdatePlaylist,
	validatePatchPlaylist,
} from "../middlewares/playlist-validation.middleware.js";
import { optionalAuth } from "../middlewares/authorization.middleware.js";

/**
 * Express router instance for playlist routes.
 * All routes are prefixed with '/api/playlist'
 * @type {Router}
 */
const playlistRouter = Router();

/**
 * Routes for /api/playlist.
 * Handles playlist listing and creation.
 */
playlistRouter
	.route("/")
	/**
	 * Get all playlists or search playlists.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} [req.query.q] - Playlist name search term (optional) used for case-insensitive matching
	 * @param {number} [req.query.page] - Page number for paginated playlist results (optional, defaults to 1)
	 * @param {boolean} [req.query.myPlaylists] - Flag that limits results to the authenticated user's playlists when truthy
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with playlist results and pagination metadata when applicable
	 * @throws {ForbiddenError} If `myPlaylists` is requested without an authenticated user
	 * @throws {ClientFaultError} If query parameters fail playlist query validation
	 * @throws {ServerFaultError} If playlist lookup fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/playlist?q=Practice&page=1
	 * This example demonstrates searching for playlists by name.
	 */
	.get(
		wrapAsync(optionalAuth),
		wrapAsync(validateGetAllPlaylists),
		wrapAsync(getAllOrSearchPlaylists)
	)
	/**
	 * Create a new playlist.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.name - Playlist name (required) used as the persisted display name
	 * @param {string[]} req.body.songs - Song ids included in the playlist (required, may be empty)
	 * @param {string} [req.body.visibility] - Playlist visibility (optional) limited to `public`, `private`, or `members`
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the inserted playlist id
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If a public user attempts to create a members-only playlist
	 * @throws {ClientFaultError} If the request body fails validation or references songs that do not exist
	 * @throws {ServerFaultError} If playlist creation fails unexpectedly
	 * @example
	 * // Example usage:
	 * POST /api/playlist
	 * {
	 *   "name": "My Favorite Songs",
	 *   "songs": ["song-456"],
	 *   "visibility": "private"
	 * }
	 * This example demonstrates creating a new playlist with associated songs.
	 */
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateCreatePlaylist),
		wrapAsync(checkSongExists),
		wrapAsync(createPlaylist)
	);

/**
 * Routes for /api/playlist/:id.
 * Handles read, update, patch, and delete operations for a specific playlist.
 */
playlistRouter
	.route("/:id")
	/**
	 * Get a specific playlist by id.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Playlist identifier (required) used to load the requested playlist
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with playlist details when the requester can access it
	 * @throws {ClientFaultError} If the playlist id parameter fails validation
	 * @throws {NotFoundError} If the playlist does not exist or is hidden by visibility rules
	 * @throws {ServerFaultError} If playlist retrieval fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/playlist/playlist-123
	 * This example demonstrates retrieving a specific playlist by ID.
	 */
	.get(
		wrapAsync(optionalAuth),
		wrapAsync(validateGetPlaylist),
		wrapAsync(getPlaylist)
	)
	/**
	 * Replace a specific playlist.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Playlist identifier (required) used to find the playlist to replace
	 * @param {string} req.body.name - Playlist name (required) used as the updated display name
	 * @param {string[]} req.body.songs - Song ids that should remain in the playlist after replacement
	 * @param {string} req.body.visibility - Playlist visibility (required) limited to `public`, `private`, or `members`
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the playlist was updated
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to update the playlist
	 * @throws {ClientFaultError} If the route params or request body fail validation, or referenced songs do not exist
	 * @throws {NotFoundError} If the playlist cannot be found
	 * @throws {ServerFaultError} If playlist replacement fails unexpectedly
	 * @example
	 * // Example usage:
	 * PUT /api/playlist/playlist-123
	 * {
	 *   "name": "My Favorite Songs Updated",
	 *   "visibility": "public",
	 *   "songs": ["song-456"]
	 * }
	 * This example demonstrates updating an existing playlist.
	 */
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateGetPlaylist),
		wrapAsync(validateUpdatePlaylist),
		wrapAsync(checkSongExists),
		wrapAsync(updatePlaylist)
	)
	/**
	 * Patch a specific playlist.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Playlist identifier (required) used to find the playlist to patch
	 * @param {string} [req.body.visibility] - Updated playlist visibility (optional) limited to `public`, `private`, or `members`
	 * @param {string[]} [req.body.addSongs] - Song ids to add to the playlist (optional)
	 * @param {string[]} [req.body.removeSongs] - Song ids to remove from the playlist (optional)
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the playlist was patched
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to update the playlist
	 * @throws {ClientFaultError} If the route params or request body fail validation, or referenced songs do not exist
	 * @throws {NotFoundError} If the playlist cannot be found
	 * @throws {ServerFaultError} If playlist patching fails unexpectedly
	 * @example
	 * // Example usage:
	 * PATCH /api/playlist/playlist-123
	 * {
	 *   "visibility": "members",
	 *   "addSongs": ["song-789"]
	 * }
	 * This example demonstrates partially updating a playlist.
	 */
	.patch(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateGetPlaylist),
		wrapAsync(validatePatchPlaylist),
		wrapAsync(patchPlaylist)
	)
	/**
	 * Delete a specific playlist.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Playlist identifier (required) used to find the playlist to delete
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the playlist was deleted
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to delete the playlist
	 * @throws {ClientFaultError} If the playlist id parameter fails validation
	 * @throws {NotFoundError} If the playlist cannot be found
	 * @throws {ServerFaultError} If playlist deletion fails unexpectedly
	 * @example
	 * // Example usage:
	 * DELETE /api/playlist/playlist-123
	 * This example demonstrates deleting a specific playlist.
	 */
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateGetPlaylist),
		wrapAsync(deletePlaylist)
	);

export default playlistRouter;

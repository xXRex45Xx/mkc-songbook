/**
 * Album Routes Module.
 * Handles all album-related routes including creation, listing, updating and deletion.
 * Some routes require authentication and admin privileges.
 * @module routes/album
 */

import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import {
	addAlbum,
	getAllOrSearchAlbums,
	getAlbum,
	updateAlbum,
	deleteAlbum,
} from "../controllers/album.controller.js";
import { albumImageUpload } from "../middlewares/file-upload.middleware.js";
import {
	validateCreateAlbum,
	validateGetAlbum,
	validateGetAllAlbums,
	validateUpdateAlbum,
} from "../middlewares/album-validation.middleware.js";
import {
	checkAlbumExists,
	checkAlbumExistsForUpdate,
	checkSongExists,
} from "../middlewares/pre-add-album.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";

/**
 * Express router instance for album routes.
 * All routes are prefixed with '/api/album'
 * @type {Router}
 */
const albumRouter = Router();

/**
 * Routes for /api/album.
 * Handles album listing and creation.
 */
albumRouter
	.route("/")
	/**
	 * Get all albums or search albums.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} [req.query.q] - Album name search term (optional) used for case-insensitive matching
	 * @param {boolean} [req.query.names] - Flag that limits the response to album names only when truthy
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with album results
	 * @throws {ClientFaultError} If query parameters fail album query validation
	 * @throws {ServerFaultError} If album lookup fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/album?q=Amazing
	 * This example demonstrates searching for albums by title.
	 */
	.get(
		wrapAsync(validateGetAllAlbums),
		wrapAsync(getAllOrSearchAlbums)
	)
	/**
	 * Create a new album.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.id - Album identifier (required) used as the persisted album id
	 * @param {string} req.body.title - Album title (required) used as the persisted album name
	 * @param {string[]} req.body.songs - Song ids that should belong to the album after creation
	 * @param {string} [req.body.createdAt] - Album year value (optional) stored with the album document
	 * @param {Object} [req.file] - Uploaded cover image parsed from the `cover` multipart field
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the inserted album id
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to create albums
	 * @throws {ClientFaultError} If the request body fails validation or referenced songs do not exist
	 * @throws {ServerFaultError} If album creation fails unexpectedly
	 * @example
	 * // Example usage:
	 * POST /api/album
	 * {
	 *   "id": "album-123",
	 *   "title": "Amazing Grace Album",
	 *   "songs": ["song-456"]
	 * }
	 * This example demonstrates creating a new album with associated songs.
	 */
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		albumImageUpload.single("cover"),
		wrapAsync(validateCreateAlbum),
		wrapAsync(checkAlbumExists),
		wrapAsync(checkSongExists),
		wrapAsync(addAlbum)
	);

/**
 * Routes for /api/album/:id.
 * Handles read, update, and delete operations for a specific album.
 */
albumRouter
	.route("/:id")
	/**
	 * Get a specific album by id.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Album identifier (required) used to retrieve the requested album
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with album details
	 * @throws {ClientFaultError} If the album id parameter fails validation
	 * @throws {NotFoundError} If the album cannot be found
	 * @throws {ServerFaultError} If album retrieval fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/album/album-123
	 * This example demonstrates retrieving a specific album by ID.
	 */
	.get(
		wrapAsync(validateGetAlbum),
		wrapAsync(getAlbum)
	)
	/**
	 * Replace a specific album.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Existing album identifier (required) used to find the album to replace
	 * @param {string} req.body.id - Album identifier (required) to persist after the update
	 * @param {string} req.body.title - Album title (required) used as the updated album name
	 * @param {string[]} req.body.songs - Song ids that should belong to the album after replacement
	 * @param {string} [req.body.createdAt] - Album year value (optional) stored with the updated album document
	 * @param {Object} [req.file] - Uploaded cover image parsed from the `cover` multipart field
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the album was updated
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to update albums
	 * @throws {ClientFaultError} If the route params or request body fail validation, or referenced songs do not exist
	 * @throws {NotFoundError} If the album cannot be found
	 * @throws {ServerFaultError} If album replacement fails unexpectedly
	 * @example
	 * // Example usage:
	 * PUT /api/album/album-123
	 * {
	 *   "id": "album-123",
	 *   "title": "Amazing Grace Album Updated",
	 *   "songs": ["song-456"]
	 * }
	 * This example demonstrates updating an existing album.
	 */
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		albumImageUpload.single("cover"),
		wrapAsync(validateGetAlbum),
		wrapAsync(validateUpdateAlbum),
		wrapAsync(checkAlbumExistsForUpdate),
		wrapAsync(checkSongExists),
		wrapAsync(updateAlbum)
	)
	/**
	 * Delete a specific album.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Album identifier (required) used to find the album to delete
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the album was deleted
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to delete albums
	 * @throws {ClientFaultError} If the album id parameter fails validation
	 * @throws {NotFoundError} If the album cannot be found
	 * @throws {ServerFaultError} If album deletion fails unexpectedly
	 * @example
	 * // Example usage:
	 * DELETE /api/album/album-123
	 * This example demonstrates deleting a specific album.
	 */
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetAlbum),
		wrapAsync(deleteAlbum)
	);

export default albumRouter;

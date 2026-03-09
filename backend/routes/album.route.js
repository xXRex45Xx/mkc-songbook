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
 * Routes for /api/album
 * Handles album listing and creation
 *
 * This route creates a new album in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid album data,
 * including ID, title, description, and associated songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.id - Unique album ID (required) with explanation of generation method and validation rules
 * @param {string} req.body.title - Album title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} [req.body.description] - Album description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @param {string[]} req.body.songs - Array of song IDs this album contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/album
 * {
 *   "id": "album-123",
 *   "title": "Amazing Grace Album",
 *   "description": "Album featuring traditional hymns",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates creating a new album with associated songs.
 */
albumRouter
	.route("/")
	/**
	 * GET /api/album
	 * Get all albums or search albums.
	 *
	 * This function retrieves albums from the database based on specified criteria.
	 * It supports searching by title, description, ID, and other attributes with pagination support
	 * for efficient data retrieval. The function handles various search types and sorting options
	 * to provide flexible access to data.
	 *
	 * @param {Object} req - Express request object containing query parameters
 * @property {string} [req.query.q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [req.query.page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {string} [req.query.type] - Search type (optional) with description of available search modes and their behavior
 * @property {('A-Z'|'Number'|'Recently Added')} [req.query.sortBy] - Sort order (optional) with detailed explanation of sorting options and orderings
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with albums and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no albums match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/album?q=Amazing&sortBy=A-Z&page=1
 * This example demonstrates searching for albums by title.
 */
	.get(
		wrapAsync(validateGetAllAlbums),
		wrapAsync(getAllOrSearchAlbums)
	)
	/**
	 * POST /api/album
	 * Create a new album. Requires admin privileges.
	 *
	 * This function creates a new album entity in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the created entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.id - Unique album ID (required) with explanation of generation method and validation rules
 * @property {string} req.body.title - Album title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} [req.body.description] - Album description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @property {string[]} req.body.songs - Array of song IDs this album contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/album
 * {
 *   "id": "album-123",
 *   "title": "Amazing Grace Album",
 *   "description": "Album featuring traditional hymns",
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
 * Routes for /api/album/:id
 * Handles operations on specific albums
 *
 * This route updates an existing album in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid album data,
 * including ID, title, description, and associated songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.id - Unique album ID (required) with explanation of generation method and validation rules
 * @param {string} req.body.title - Album title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} [req.body.description] - Album description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @param {string[]} req.body.songs - Array of song IDs this album contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated album data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/album/album-123
 * {
 *   "id": "album-123",
 *   "title": "Amazing Grace Album Updated",
 *   "description": "Updated album featuring traditional hymns",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates updating an existing album.
 */
albumRouter
	.route("/:id")
	/**
	 * GET /api/album/:id
	 * Get a specific album by ID.
	 *
	 * This function retrieves a specific album from the database based on its ID.
	 * It returns detailed information about the album including title, description, songs, etc.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - Album ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with album details explaining the complete process flow
 * @throws {NotFoundError} If no album matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
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
	 * PUT /api/album/:id
	 * Update a specific album. Requires admin privileges.
	 *
	 * This function updates an existing album in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the updated entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.id - Unique album ID (required) with explanation of generation method and validation rules
 * @property {string} req.body.title - Album title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} [req.body.description] - Album description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @property {string[]} req.body.songs - Array of song IDs this album contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated album data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/album/album-123
 * {
 *   "id": "album-123",
 *   "title": "Amazing Grace Album Updated",
 *   "description": "Updated album featuring traditional hymns",
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
	 * DELETE /api/album/:id
	 * Delete a specific album.
	 *
	 * This function deletes a specific album from the database based on its ID.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - Album ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response confirming deletion and success message explaining the complete process flow
 * @throws {NotFoundError} If no album matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
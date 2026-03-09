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
 * Routes for /api/playlist
 * Handles playlist listing and creation
 *
 * This route creates a new playlist in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid playlist data,
 * including name, description, and associated songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.name - Playlist name (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} [req.body.description] - Playlist description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @param {string[]} req.body.songs - Array of song IDs this playlist contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/playlist
 * {
 *   "name": "My Favorite Songs",
 *   "description": "A collection of my favorite hymns",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates creating a new playlist with associated songs.
 */
playlistRouter
	.route("/")
	/**
	 * GET /api/playlist
	 * Get all playlists or search playlists.
	 *
	 * This function retrieves playlists from the database based on specified criteria.
	 * It supports searching by name, description, ID, and other attributes with pagination support
	 * for efficient data retrieval. The function handles various search types and sorting options
	 * to provide flexible access to data.
	 *
	 * @param {Object} req - Express request object containing query parameters
 * @property {string} [req.query.q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [req.query.page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {string} [req.query.type] - Search type (optional) with description of available search modes and their behavior
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with playlists and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no playlists match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/playlist?q=Amazing&sortBy=A-Z&page=1
 * This example demonstrates searching for playlists by name.
 */
	.get(
		wrapAsync(optionalAuth),
		wrapAsync(validateGetAllPlaylists),
		wrapAsync(getAllOrSearchPlaylists)
	)
	/**
	 * POST /api/playlist
	 * Create a new playlist. Requires admin privileges.
	 *
	 * This function creates a new playlist entity in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the created entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.name - Playlist name (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} [req.body.description] - Playlist description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @property {string[]} req.body.songs - Array of song IDs this playlist contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/playlist
 * {
 *   "name": "My Favorite Songs",
 *   "description": "A collection of my favorite hymns",
 *   "songs": ["song-456"]
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
 * Routes for /api/playlist/:id
 * Handles operations on specific playlists
 *
 * This route updates an existing playlist in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid playlist data,
 * including name, description, and associated songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.name - Playlist name (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} [req.body.description] - Playlist description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @param {string[]} req.body.songs - Array of song IDs this playlist contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated playlist data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/playlist/playlist-123
 * {
 *   "name": "My Favorite Songs Updated",
 *   "description": "Updated collection of my favorite hymns",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates updating an existing playlist.
 */
playlistRouter
	.route("/:id")
	/**
	 * GET /api/playlist/:id
	 * Get a specific playlist by ID.
	 *
	 * This function retrieves a specific playlist from the database based on its ID.
	 * It returns detailed information about the playlist including name, description, songs, etc.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - Playlist ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with playlist details explaining the complete process flow
 * @throws {NotFoundError} If no playlist matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
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
	 * PUT /api/playlist/:id
	 * Update a specific playlist. Requires admin privileges.
	 *
	 * This function updates an existing playlist in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the updated entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.name - Playlist name (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} [req.body.description] - Playlist description (optional, 2-500 characters) with explanation of content constraints and text limitations
 * @property {string[]} req.body.songs - Array of song IDs this playlist contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated playlist data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/playlist/playlist-123
 * {
 *   "name": "My Favorite Songs Updated",
 *   "description": "Updated collection of my favorite hymns",
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
	 * PATCH /api/playlist/:id
	 * Partially update a specific playlist. Requires admin privileges.
	 *
	 * This function partially updates an existing playlist in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the updated entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} [req.body.name] - Playlist name (optional) with description of content constraints, character limits, and validation rules
 * @property {string} [req.body.description] - Playlist description (optional) with explanation of content constraints and text limitations
 * @property {string[]} [req.body.songs] - Array of song IDs this playlist contains (optional) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated playlist data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PATCH /api/playlist/playlist-123
 * {
 *   "name": "My Favorite Songs Updated"
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
	 * DELETE /api/playlist/:id
	 * Delete a specific playlist.
	 *
	 * This function deletes a specific playlist from the database based on its ID.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - Playlist ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response confirming deletion and success message explaining the complete process flow
 * @throws {NotFoundError} If no playlist matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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

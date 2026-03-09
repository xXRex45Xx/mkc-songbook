/**
 * Song Routes Module.
 * Handles all song-related routes including creation, listing, updating and deletion.
 * Some routes require authentication and admin privileges.
 * @module routes/song
 */

import { Router } from "express";
import {
	addSong,
	deleteSong,
	getAllOrSearchSongs,
	getSong,
	updateSong,
} from "../controllers/song.controller.js";
import { wrapAsync } from "../utils/error.util.js";
import {
	validateCreateSong,
	validateGetAllSongs,
	validateGetSong,
} from "../middlewares/song-validation.middleware.js";
import mapSongSortBy from "../middlewares/song-map-sortby.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";

/**
 * Express router instance for song routes.
 * All routes are prefixed with '/api/song'
 * @type {Router}
 */
const songRouter = Router();

/**
 * Routes for /api/song
 * Handles song listing and creation
 *
 * This route creates a new song in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid song data,
 * including ID, title, lyrics, chord, tempo, rhythm, albums, and associated audio file.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.id - Unique song ID (required) with explanation of generation method and validation rules
 * @param {string} req.body.title - Song title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} req.body.lyrics - Song lyrics (required, 2-5000 characters) with explanation of text limitations and content requirements
 * @param {string} req.body.chord - Chord notation (required, 2-1000 characters) with explanation of format validation and content constraints
 * @param {number} req.body.tempo - Tempo value (required, 50-300 BPM) with explanation of tempo range limits and musical context
 * @param {string} req.body.rhythm - Rhythm notation (required, 2-50 characters) with explanation of rhythm format validation
 * @param {string[]} req.body.albums - Array of album IDs this song belongs to (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded audio file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/song
 * {
 *   "id": "song-456",
 *   "title": "Amazing Grace",
 *   "lyrics": "Amazing grace... ",
 *   "chord": "C G Am F",
 *   "tempo": 120,
 *   "rhythm": "4/4",
 *   "albums": ["album-123"]
 * }
 * This example demonstrates creating a new song with associated album.
 */
songRouter
	.route("/")
	/**
	 * GET /api/song
	 * Get all songs or search songs.
	 *
	 * This function retrieves songs from the database based on specified criteria.
	 * It supports searching by title, lyrics, ID, and other attributes with pagination support
	 * for efficient data retrieval. The function handles various search types and sorting options
	 * to provide flexible access to data.
	 *
	 * @param {Object} req - Express request object containing query parameters
 * @property {string} [req.query.q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [req.query.page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {string} [req.query.type] - Search type (optional) with description of available search modes and their behavior
 * @property {('A-Z'|'Number'|'Recently Added')} [req.query.sortBy] - Sort order (optional) with detailed explanation of sorting options and orderings
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with songs and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no songs match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/song?q=Amazing&sortBy=A-Z&page=1
 * This example demonstrates searching for songs by title.
 */
	.get(
		wrapAsync(validateGetAllSongs),
		wrapAsync(mapSongSortBy),
		wrapAsync(getAllOrSearchSongs)
	)
	/**
	 * POST /api/song
	 * Create a new song. Requires admin privileges.
	 *
	 * This function creates a new song entity in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the created entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.id - Unique song ID (required) with explanation of generation method and validation rules
 * @property {string} req.body.title - Song title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} req.body.lyrics - Song lyrics (required, 2-5000 characters) with explanation of text limitations and content requirements
 * @property {string} req.body.chord - Chord notation (required, 2-1000 characters) with explanation of format validation and content constraints
 * @property {number} req.body.tempo - Tempo value (required, 50-300 BPM) with explanation of tempo range limits and musical context
 * @property {string} req.body.rhythm - Rhythm notation (required, 2-50 characters) with explanation of rhythm format validation
 * @property {string[]} req.body.albums - Array of album IDs this song belongs to (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded audio file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/song
 * {
 *   "id": "song-456",
 *   "title": "Amazing Grace",
 *   "lyrics": "Amazing grace... ",
 *   "chord": "C G Am F",
 *   "tempo": 120,
 *   "rhythm": "4/4",
 *   "albums": ["album-123"]
 * }
 * This example demonstrates creating a new song with associated album.
 */
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateCreateSong),
		wrapAsync(addSong)
	);

/**
 * Routes for /api/song/:id
 * Handles operations on specific songs
 *
 * This route updates an existing song in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid song data,
 * including ID, title, lyrics, chord, tempo, rhythm, albums, and associated audio file.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.id - Unique song ID (required) with explanation of generation method and validation rules
 * @param {string} req.body.title - Song title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} req.body.lyrics - Song lyrics (required, 2-5000 characters) with explanation of text limitations and content requirements
 * @param {string} req.body.chord - Chord notation (required, 2-1000 characters) with explanation of format validation and content constraints
 * @param {number} req.body.tempo - Tempo value (required, 50-300 BPM) with explanation of tempo range limits and musical context
 * @param {string} req.body.rhythm - Rhythm notation (required, 2-50 characters) with explanation of rhythm format validation
 * @param {string[]} req.body.albums - Array of album IDs this song belongs to (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded audio file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated song data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/song/song-456
 * {
 *   "id": "song-456",
 *   "title": "Amazing Grace Updated",
 *   "lyrics": "Amazing grace... ",
 *   "chord": "C G Am F",
 *   "tempo": 120,
 *   "rhythm": "4/4",
 *   "albums": ["album-123"]
 * }
 * This example demonstrates updating an existing song.
 */
songRouter
	.route("/:id")
	/**
	 * GET /api/song/:id
	 * Get a specific song by ID.
	 *
	 * This function retrieves a specific song from the database based on its ID.
	 * It returns detailed information about the song including title, lyrics, chord, tempo, rhythm, albums, etc.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - Song ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with song details explaining the complete process flow
 * @throws {NotFoundError} If no song matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/song/song-456
 * This example demonstrates retrieving a specific song by ID.
 */
	.get(wrapAsync(validateGetSong), wrapAsync(getSong))
	/**
	 * PUT /api/song/:id
	 * Update a specific song. Requires admin privileges.
	 *
	 * This function updates an existing song in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the updated entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.id - Unique song ID (required) with explanation of generation method and validation rules
 * @property {string} req.body.title - Song title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} req.body.lyrics - Song lyrics (required, 2-5000 characters) with explanation of text limitations and content requirements
 * @property {string} req.body.chord - Chord notation (required, 2-1000 characters) with explanation of format validation and content constraints
 * @property {number} req.body.tempo - Tempo value (required, 50-300 BPM) with explanation of tempo range limits and musical context
 * @property {string} req.body.rhythm - Rhythm notation (required, 2-50 characters) with explanation of rhythm format validation
 * @property {string[]} req.body.albums - Array of album IDs this song belongs to (required) with explanation of relationship mapping and constraint validation
 * @param {Object} req.file - Uploaded audio file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated song data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/song/song-456
 * {
 *   "id": "song-456",
 *   "title": "Amazing Grace Updated",
 *   "lyrics": "Amazing grace... ",
 *   "chord": "C G Am F",
 *   "tempo": 120,
 *   "rhythm": "4/4",
 *   "albums": ["album-123"]
 * }
 * This example demonstrates updating an existing song.
 */
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetSong),
		wrapAsync(validateCreateSong),
		wrapAsync(updateSong)
	)
	/**
	 * DELETE /api/song/:id
	 * Delete a specific song.
	 *
	 * This function deletes a specific song from the database based on its ID.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - Song ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response confirming deletion and success message explaining the complete process flow
 * @throws {NotFoundError} If no song matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * DELETE /api/song/song-456
 * This example demonstrates deleting a specific song.
 */
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetSong),
		wrapAsync(deleteSong)
	);

export default songRouter;
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
	patchSong,
	streamSongAudio,
	updateSong,
} from "../controllers/song.controller.js";
import { wrapAsync } from "../utils/error.util.js";
import {
	validateCreateSong,
	validateGetAllSongs,
	validateGetSong,
	validatePatchSong,
} from "../middlewares/song-validation.middleware.js";
import mapSongSortBy from "../middlewares/song-map-sortby.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";
import { checkAlbumExists, checkSongNumberExists } from "../middlewares/pre-add-song.middleware.js";
import { audioUpload } from "../middlewares/file-upload.middleware.js"
import { checkSongNumberConflict } from "../middlewares/pre-update-song.middleware.js";

/**
 * Express router instance for song routes.
 * All routes are prefixed with '/api/song'
 * @type {Router}
 */
const songRouter = Router();

/**
 * Routes for /api/song.
 * Handles public song listing and privileged song creation.
 */
songRouter
	.route("/")
	/**
	 * Get all songs or search songs.
	 *
	 * Retrieves songs with optional pagination, search, and sorting filters.
	 *
	 * @param {Object} req - Express request object containing query parameters
	 * @param {string} [req.query.q] - Search query string used with a matching search type
	 * @param {number} [req.query.page] - Page number for paginated results
	 * @param {string} [req.query.type] - Search type used to match `title`, `lyrics`, `id`, or grouped `all` search results
	 * @param {boolean} [req.query.all] - Flag that returns the full song list without paginated metadata when truthy
	 * @param {("A-Z"|"Number"|"Recently Added")} [req.query.sortBy] - Sort option applied before returning results
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with songs and pagination metadata
	 * @throws {ClientFaultError} If query parameters do not satisfy the search validation rules
	 * @throws {NotFoundError} If no songs match the provided search criteria
	 * @throws {ServerFaultError} If the song query fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/song?q=Amazing&type=title&sortBy=A-Z&page=1
	 * This example demonstrates searching for songs by title.
	 */
	.get(
		wrapAsync(validateGetAllSongs),
		wrapAsync(mapSongSortBy),
		wrapAsync(getAllOrSearchSongs)
	)
	/**
	 * Create a new song.
	 *
	 * Creates a song record, validates any referenced albums, and optionally stores an uploaded
	 * audio file. This route requires an authenticated admin or super-admin user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.id - Unique song identifier used as the persisted song id
	 * @param {string} req.body.title - Song title submitted for the new song record
	 * @param {string} req.body.lyrics - Song lyrics content stored with the song
	 * @param {string} [req.body.chord] - Chord notation saved in the song music elements
	 * @param {number} [req.body.tempo] - Tempo value stored in the song music elements
	 * @param {string} [req.body.rythm] - Rhythm value stored in the song music elements
	 * @param {string|string[]} [req.body.albums] - Album ids the song should be attached to
	 * @param {Object} [req.file] - Uploaded audio file parsed from the `audio-file` multipart field
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the inserted song id
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to create songs
	 * @throws {ClientFaultError} If the request body fails validation or the song id already exists
	 * @throws {NotFoundError} If a referenced album cannot be found
	 * @throws {ServerFaultError} If the song cannot be created
	 * @example
	 * // Example usage:
	 * POST /api/song
	 * {
	 *   "id": "song-456",
	 *   "title": "Amazing Grace",
	 *   "lyrics": "Amazing grace...",
	 *   "chord": "C G Am F",
	 *   "tempo": 120,
	 *   "rythm": "4/4",
	 *   "albums": ["album-123"]
	 * }
	 * This example demonstrates creating a song with album associations.
	 */
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		audioUpload.single("audio-file"),
		wrapAsync(validateCreateSong),
		wrapAsync(checkSongNumberExists),
		wrapAsync(checkAlbumExists),
		wrapAsync(addSong)
	);

/**
 * Routes for /api/song/:id.
 * Handles read, update, patch, and deletion operations for a specific song.
 */
songRouter
	.route("/:id")
	/**
	 * Get a specific song by id.
	 *
	 * Retrieves a single song document and returns its public song data.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Song identifier to retrieve
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the requested song
	 * @throws {ClientFaultError} If the song id parameter is invalid
	 * @throws {NotFoundError} If the song cannot be found
	 * @throws {ServerFaultError} If the song lookup fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/song/song-456
	 * This example demonstrates retrieving a song by id.
	 */
	.get(wrapAsync(validateGetSong), wrapAsync(getSong))
	/**
	 * Replace an existing song.
	 *
	 * Fully updates the target song, including song metadata, album associations, and an optional
	 * replacement audio upload. This route requires an authenticated admin or super-admin user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Existing song identifier to update
	 * @param {string} req.body.id - Song identifier to persist after the update
	 * @param {string} req.body.title - Updated song title
	 * @param {string} req.body.lyrics - Updated song lyrics
	 * @param {string} [req.body.chord] - Updated chord notation
	 * @param {number} [req.body.tempo] - Updated tempo value
	 * @param {string} [req.body.rythm] - Updated rhythm value
	 * @param {string|string[]} [req.body.albums] - Album ids that should contain the song after the update
	 * @param {Object} [req.file] - Uploaded audio file parsed from the `audio-file` multipart field
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming the update
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to update songs
	 * @throws {ClientFaultError} If the request body is invalid or the new song id conflicts with another song
	 * @throws {NotFoundError} If the target song or a referenced album cannot be found
	 * @throws {ServerFaultError} If the update fails unexpectedly
	 * @example
	 * // Example usage:
	 * PUT /api/song/song-456
	 * {
	 *   "id": "song-456",
	 *   "title": "Amazing Grace Updated",
	 *   "lyrics": "Amazing grace...",
	 *   "chord": "C G Am F",
	 *   "tempo": 120,
	 *   "rythm": "4/4",
	 *   "albums": ["album-123"]
	 * }
	 * This example demonstrates replacing an existing song.
	 */
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		audioUpload.single("audio-file"),
		wrapAsync(validateGetSong),
		wrapAsync(validateCreateSong),
		wrapAsync(checkSongNumberConflict),
		wrapAsync(checkAlbumExists),
		wrapAsync(updateSong)
	)
	/**
	 * Partially update a song.
	 *
	 * Updates patchable song fields such as the YouTube link and optional uploaded audio file.
	 * This route requires an authenticated admin or super-admin user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Song identifier to patch
	 * @param {string} [req.body.video-link] - YouTube URL to store as the song video link
	 * @param {Object} [req.file] - Uploaded audio file parsed from the `audio-file` multipart field
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming the patch operation
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to patch songs
	 * @throws {ClientFaultError} If the song id or patch body fails validation
	 * @throws {NotFoundError} If the target song cannot be found
	 * @throws {ServerFaultError} If the patch operation fails unexpectedly
	 * @example
	 * // Example usage:
	 * PATCH /api/song/song-456
	 * {
	 *   "video-link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
	 * }
	 * This example demonstrates updating a song video link.
	 */
	.patch(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		audioUpload.single("audio-file"),
		wrapAsync(validateGetSong),
		wrapAsync(validatePatchSong),
		wrapAsync(patchSong)
	)
	/**
	 * Delete a specific song.
	 *
	 * Deletes the requested song and removes its album relationships. This route requires an
	 * authenticated admin or super-admin user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - Song identifier to delete
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming the deletion
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to delete songs
	 * @throws {ClientFaultError} If the song id parameter is invalid
	 * @throws {NotFoundError} If the song cannot be found
	 * @throws {ServerFaultError} If the delete operation fails unexpectedly
	 * @example
	 * // Example usage:
	 * DELETE /api/song/song-456
	 * This example demonstrates deleting a song by id.
	 */
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetSong),
		wrapAsync(deleteSong)
	);

/**
 * GET /api/song/:id/audio
 * Stream a song audio file.
 *
 * Streams the stored audio file for a song and supports ranged requests for playback.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.params.id - Song identifier whose audio should be streamed
 * @param {string} [req.headers.range] - Optional byte range header used for partial streaming
 * @param {Object} res - Express response object for sending the audio stream
 * @returns {Promise<void>} Streams the requested audio content to the client
 * @throws {NotFoundError} If the song cannot be found or does not have an audio file
 * @throws {ServerFaultError} If the stored audio file is missing or cannot be streamed
 * @example
 * // Example usage:
 * GET /api/song/song-456/audio
 * This example demonstrates streaming a song audio file.
 */
songRouter.get("/:id/audio", wrapAsync(streamSongAudio));

export default songRouter;

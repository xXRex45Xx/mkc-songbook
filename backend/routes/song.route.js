/**
 * Song Routes Module.
 * Handles all song-related routes including CRUD operations and search functionality.
 * Some routes require authentication and admin privileges.
 * @module routes/song
 */

import { Router } from "express";
import {
	addSong,
	deleteSong,
	getAllOrSearchSongs,
	getSong,
	streamSongAudio,
	updateSong,
} from "../controllers/song.controller.js";
import { wrapAsync } from "../utils/error.util.js";
import {
	validateCreateSong,
	validateGetAllSongs,
	validateGetSong,
} from "../middlewares/song-validation.middleware.js";
import mapSongSortBy from "../middlewares/song-map-sortby.middleware.js";
import { audioUpload } from "../middlewares/file-upload.middleware.js";
import {
	checkAlbumExists,
	checkSongNumberExists,
} from "../middlewares/pre-add-song.middleware.js";
import { checkSongNumberConflict } from "../middlewares/pre-update-song.middleware.js";
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
 */
songRouter
	.route("/")
	/**
	 * GET /api/song
	 * Get all songs or search songs based on query parameters.
	 * @route GET /api/song
	 * @middleware validateGetAllSongs - Validates search parameters
	 * @middleware mapSongSortBy - Maps user-friendly sort options to DB fields
	 * @query {string} [q] - Search query
	 * @query {number} [page] - Page number for pagination
	 * @query {string} [type] - Search type (all/title/lyrics/id)
	 * @query {boolean} [all] - Whether to return all songs
	 * @query {string} [sortBy] - Sort option (A-Z/Number/Recently Added)
	 */
	.get(
		wrapAsync(validateGetAllSongs),
		wrapAsync(mapSongSortBy),
		wrapAsync(getAllOrSearchSongs)
	)
	/**
	 * POST /api/song
	 * Create a new song. Requires admin privileges.
	 * @route POST /api/song
	 * @security JWT
	 * @middleware passport.authenticate - Validates JWT token
	 * @middleware roleBasedAuthorization - Ensures user is admin
	 * @middleware audioUpload - Handles audio file upload
	 * @middleware validateCreateSong - Validates song data
	 * @middleware checkSongNumberExists - Prevents duplicate song IDs
	 * @middleware checkAlbumExists - Validates album references
	 * @body {Object} body - Song data
	 * @body {string} body.id - Unique song ID
	 * @body {string} body.title - Song title
	 * @body {string} body.lyrics - Song lyrics
	 * @body {string} [body.chord] - Song chord
	 * @body {number} [body.tempo] - Song tempo
	 * @body {string} [body.rythm] - Song rhythm
	 * @body {string} [body.albums] - Comma-separated album IDs
	 * @body {File} [body.audio-file] - Song audio file
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
 * Routes for /api/song/:id
 * Handles operations on specific songs
 */
songRouter
	.route("/:id")
	/**
	 * GET /api/song/:id
	 * Get a specific song by ID.
	 * @route GET /api/song/:id
	 * @middleware validateGetSong - Validates song ID
	 * @param {string} id - Song ID
	 */
	.get(wrapAsync(validateGetSong), wrapAsync(getSong))
	/**
	 * PUT /api/song/:id
	 * Update a specific song. Requires admin privileges.
	 * @route PUT /api/song/:id
	 * @security JWT
	 * @middleware passport.authenticate - Validates JWT token
	 * @middleware roleBasedAuthorization - Ensures user is admin
	 * @middleware audioUpload - Handles audio file upload
	 * @middleware validateCreateSong - Validates song data
	 * @middleware checkSongNumberConflict - Prevents ID conflicts
	 * @middleware checkAlbumExists - Validates album references
	 * @param {string} id - Song ID
	 * @body {Object} body - Updated song data (same as POST)
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
	 * DELETE /api/song/:id
	 * Delete a specific song.
	 * @route DELETE /api/song/:id
	 * @middleware validateGetSong - Validates song ID
	 * @param {string} id - Song ID
	 */
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetSong),
		wrapAsync(deleteSong)
	);

songRouter.get("/:id/audio", wrapAsync(streamSongAudio));

export default songRouter;

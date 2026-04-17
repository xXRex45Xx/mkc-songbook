/**
 * Pre-add song validation middleware module.
 * Provides middleware functions for validating song-related data before adding a new song.
 */

import SongModel from "../models/song.model.js";
import AlbumModel from "../models/album.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Checks if a song with the provided ID already exists.
 *
 * This middleware validates that no song with the specified ID already exists in the database
 * before creating a new song. It prevents duplicate song creation and maintains data integrity.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates song existence with proper database checks explaining the complete validation process flow
 * @throws {ClientFaultError} If a song with the provided ID already exists with clear explanation of duplicate condition and error context
 */
export const checkSongNumberExists = async (req, _res, next) => {
	const { id } = req.body;
	const song = await SongModel.findById(id);
	if (song)
		throw new ClientFaultError("A song exists with the provided song number");
	next();
};

/**
 * Validates that all album IDs in the request exist in the database.
 *
 * This middleware validates all album IDs provided in the song creation request against
 * the database to ensure they exist. It handles comma-separated album IDs and converts them
 * into an array of album objects for proper processing.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates album existence with proper database queries explaining the complete validation process flow
 * @throws {ClientFaultError} If any of the provided album IDs don't exist with detailed error explanation of missing albums
 */
export const checkAlbumExists = async (req, _res, next) => {
	const { albums: albumIds } = req.body;
	if (!albumIds) return next();
	const albumIdsList = albumIds.split(",");

	const existingAlbums = await AlbumModel.find({
		_id: { $in: albumIdsList },
	});

	const foundAlbums = new Map(
		existingAlbums.map((album) => [album._id, album])
	);

	const missingAlbumIds = albumIdsList.filter((id) => !foundAlbums.has(id));

	if (missingAlbumIds.length > 0)
		throw new ClientFaultError(
			`The following albums don't exist: ${missingAlbumIds.join(", ")}`
		);

	req.body.albums = albumIdsList.map((id) => foundAlbums.get(id));
	next();
};

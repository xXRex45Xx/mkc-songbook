/**
 * Pre-add album validation middleware module.
 * Provides middleware functions for validating album-related data before adding a new album.
 * These middlewares ensure data integrity by checking for duplicate albums and validating song references.
 * @module middlewares/pre-add-album
 */

import SongModel from "../models/song.model.js";
import { ClientFaultError, NotFoundError } from "../utils/error.util.js";
import AlbumModel from "../models/album.model.js";

/**
 * Middleware to validate that all songs in the album creation request exist.
 *
 * This middleware validates all song IDs provided in the album creation request against
 * the database to ensure they exist. It uses a single database query for efficiency
 * and provides detailed error messages for missing songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body containing album data with explanation of song ID validation rules and format requirements
 * @param {string[]} req.body.songs - Array of song IDs to validate with explanation of required format and validation rules
 * @param {Object} res - Express response object for sending responses back to client (unused)
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates song existence with proper database queries explaining the complete validation process flow
 * @throws {ClientFaultError} When songs array is invalid or contains non-existent song IDs with detailed error explanation
 */
export const checkSongExists = async (req, _res, next) => {
    const { songs: songIds } = req.body;

    // Find all songs in a single query
    const existingSongs = await SongModel.find({
        _id: { $in: songIds },
    });

    const foundSongMap = new Map(existingSongs.map((song) => [song._id, song]));

    // Find missing song IDs
    const missingSongIds = songIds.filter((id) => !foundSongMap.has(id));

    if (missingSongIds.length > 0) {
        throw new ClientFaultError(
            `The following songs don't exist: ${missingSongIds.join(", ")}`
        );
    }

    // Preserve the original order of songs as specified in the request
    req.body.songs = songIds.map((id) => foundSongMap.get(id));
    next();
};

/**
 * Checks if an album with the provided ID already exists to prevent duplicates.
 *
 * This middleware validates that no album with the specified ID already exists in the database
 * before creating a new album. It prevents duplicate album creation and maintains data integrity.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body containing album data with explanation of ID validation rules and format requirements
 * @param {string} req.body.id - Album ID to check for uniqueness with explanation of required format and validation rules
 * @param {Object} res - Express response object for sending responses back to client (unused)
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates album existence with proper database checks explaining the complete validation process flow
 * @throws {ClientFaultError} When an album with the provided ID already exists with clear explanation of duplicate condition and error context
 */
export const checkAlbumExists = async (req, _res, next) => {
    const { id } = req.body;
    const album = await AlbumModel.findById(id);
    if (album)
        throw new ClientFaultError(
            `Album with id ${album._id} already exists.`
        );
    next();
};

/**
 * Checks if an album exists for update operations and validates ID changes.
 *
 * This middleware validates that the album being updated exists in the database,
 * and ensures that any ID change is unique (no other album has the same new ID).
 * It prevents updates to non-existent albums and maintains data integrity.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Request parameters containing album ID with explanation of validation rules and format requirements
 * @param {string} req.params.id - Album ID for update operations with explanation of required format and validation rules
 * @param {Object} req.body - Request body containing updated album data with explanation of validation rules and format requirements
 * @param {string} req.body.id - New album ID if changing the album ID with explanation of validation rules and format requirements
 * @param {Object} res - Express response object for sending responses back to client (unused)
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates album existence and ID uniqueness with proper database checks explaining the complete validation process flow
 * @throws {NotFoundError} When album with specified ID doesn't exist with clear explanation of not found condition and error context
 * @throws {ClientFaultError} When attempting to change album ID to an already existing ID with clear explanation of duplicate condition and error context
 */
export const checkAlbumExistsForUpdate = async (req, _res, next) => {
    const { id } = req.params;
    const album = await AlbumModel.findById(id);
    if (!album) throw new NotFoundError(`Album with id ${id} does not exist.`);
    if (req.body.id !== id) {
        const albumWithNewId = await AlbumModel.findById(req.body.id);
        if (albumWithNewId)
            throw new ClientFaultError(
                `Album with id ${req.body.id} already exists.`
            );
    }
    next();
};

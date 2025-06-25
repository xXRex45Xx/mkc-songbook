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
 * Uses a single database query to check all songs and provides detailed error messages.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing album data
 * @param {string[]} req.body.songs - Array of song IDs to validate
 * @param {Object} _res - Express response object (unused)
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} When songs array is invalid or contains non-existent song IDs
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
 * This middleware should be called before creating a new album.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing album data
 * @param {string} req.body.id - Album ID to check for uniqueness
 * @param {Object} _res - Express response object (unused)
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} When an album with the provided ID already exists
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

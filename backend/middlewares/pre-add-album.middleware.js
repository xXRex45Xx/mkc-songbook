/**
 * Pre-add album validation middleware module.
 * Provides middleware functions for validating album-related data before adding a new album.
 */

import SongModel from "../models/song.model.js";
import { ClientFaultError } from "../utils/error.util.js";
import AlbumModel from "../models/album.model.js";

/**
 * Validates that all songs specified in the album creation request exist.
 * Replaces the song IDs in the request body with the actual song documents.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing album data
 * @param {string[]} req.body.songs - Array of song IDs to include in the album
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} If any of the specified songs don't exist
 */
export const checkSongExists = async (req, _res, next) => {
    const { songs: songIds } = req.body;
    let songs = [];

    for (const songId of songIds) {
        songs.push(SongModel.findById(songId));
    }

    songs = await Promise.all(songs);
    const songIdsWithNull = songs.filter((song) => song === null);
    if (songIdsWithNull.length > 0) {
        let errorMessage = "The following song ids don't exist: ";
        songIdsWithNull.forEach((songId, idx) => {
            if (idx === songIdsWithNull.length - 1) {
                errorMessage += songId;
                return;
            }
            errorMessage += `${songId}, `;
        });
        throw new ClientFaultError(errorMessage);
    }

    req.body.songs = songs;
    next();
};

/**
 * Checks if an album with the provided ID already exists.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing album data
 * @param {string} req.body.id - Album ID to check
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} If an album with the provided ID already exists
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

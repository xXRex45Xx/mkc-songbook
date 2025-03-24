/**
 * Pre-update song validation middleware module.
 * Provides middleware functions for validating song-related data before updating an existing song.
 */

import SongModel from "../models/song.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Checks if updating a song's ID would conflict with an existing song.
 * If the new ID is the same as the current ID, the check is skipped.
 * @param {Object} req - Express request object containing the new song ID in body and current song ID in params
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} If another song exists with the new ID
 */
export const checkSongNumberConflict = async (req, _res, next) => {
    const { id } = req.body;
    const { id: songId } = req.params;

    if (songId == id) return next();

    const song = await SongModel.findById(id);
    if (song)
        throw new ClientFaultError(
            "A song exists with the provided song number."
        );
    next();
};

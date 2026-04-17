/**
 * Pre-update song validation middleware module.
 * Provides middleware functions for validating song-related data before updating an existing song.
 */

import SongModel from "../models/song.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Checks if updating a song's ID would conflict with an existing song.
 *
 * This middleware validates that changing the song ID to a new value won't create a conflict
 * with an existing song. It prevents duplicate song IDs and maintains data integrity by ensuring
 * each song has a unique identifier.
 *
 * @param {Object} req - Express request object containing request data with explanation of ID validation rules and format requirements
 * @param {Object} req.body - Request body containing updated song data with explanation of ID validation rules and format requirements
 * @param {string} req.body.id - New song ID to check for conflicts with explanation of required format and validation rules
 * @param {Object} req.params - Request parameters containing current song ID with explanation of validation rules and format requirements
 * @param {string} req.params.id - Current song ID that is being updated with explanation of required format and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates song ID conflicts with proper database checks explaining the complete validation process flow
 * @throws {ClientFaultError} If another song exists with the new ID with clear explanation of conflict condition and error context
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

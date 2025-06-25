/**
 * Song validation middleware module.
 * Provides middleware functions for validating song-related request data using validation schemas.
 */

import {
	createSongBodyValidationSchema,
	getAllSongsQuerySchema,
	getSongParamsSchema,
} from "../models/validation-schemas/song.validation-shcema.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates query parameters for retrieving all songs.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateGetAllSongs = async (req, _res, next) => {
	await validateSchema(req.query, getAllSongsQuerySchema);
	next();
};

/**
 * Validates URL parameters for retrieving a specific song.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateGetSong = async (req, _res, next) => {
	await validateSchema(req.params, getSongParamsSchema);
	next();
};

/**
 * Validates request body data for creating a new song.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateCreateSong = async (req, _res, next) => {
	await validateSchema(req.body, createSongBodyValidationSchema);
	next();
};

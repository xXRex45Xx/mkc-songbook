/**
 * Song validation middleware module.
 * Provides middleware functions for validating song-related request data using validation schemas.
 */

import {
	createSongBodyValidationSchema,
	getAllSongsQuerySchema,
	getSongParamsSchema,
	patchSongBodyValidationSchema,
} from "../models/validation-schemas/song.validation-shcema.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates query parameters for retrieving all songs.
 *
 * This middleware validates query parameters for song listing requests against
 * the defined validation schema. It ensures that search queries and pagination parameters
 * meet the specified criteria before proceeding with song retrieval.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates query parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetAllSongs = async (req, _res, next) => {
	await validateSchema(req.query, getAllSongsQuerySchema);
	next();
};

/**
 * Validates URL parameters for retrieving a specific song.
 *
 * This middleware validates the request parameters for song detail retrieval requests against
 * the defined validation schema. It ensures that song ID is properly formatted before proceeding.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates song parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetSong = async (req, _res, next) => {
	await validateSchema(req.params, getSongParamsSchema);
	next();
};

/**
 * Validates request body data for creating a new song.
 *
 * This middleware validates the request body for song creation requests against
 * the defined validation schema. It ensures that all required fields are present and meet criteria.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates song creation body with proper schema checking explaining the complete validation process flow
 */
export const validateCreateSong = async (req, _res, next) => {
	await validateSchema(req.body, createSongBodyValidationSchema);
	next();
};

/**
 * Validates request body data for patching a song.
 *
 * This middleware validates the request body for song patch operations against
 * the defined validation schema. It ensures that all fields in the update are properly formatted.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates song patch body with proper schema checking explaining the complete validation process flow
 */
export const validatePatchSong = async (req, _res, next) => {
	await validateSchema(req.body, patchSongBodyValidationSchema);
	next();
};


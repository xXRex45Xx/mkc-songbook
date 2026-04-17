/**
 * Album validation middleware module.
 * Provides middleware functions for validating album-related request data.
 */

import {
	createAlbumBodyValidationSchema,
	getAlbumParamsSchema,
	getAllAlbumsQuerySchema,
} from "../models/validation-schemas/album.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates the request body for creating a new album.
 *
 * This middleware validates the request body for album creation requests against
 * the defined validation schema. It ensures that songs field is always an array,
 * even when a single song is provided, before proceeding with album creation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates album creation body with proper schema checking and array normalization explaining the complete validation process flow
 */
export const validateCreateAlbum = async (req, _res, next) => {
	if (typeof req.body.songs === "string") req.body.songs = [req.body.songs];
	await validateSchema(req.body, createAlbumBodyValidationSchema);
	next();
};

/**
 * Validates the request parameters for getting album details.
 *
 * This middleware validates the request parameters for album detail retrieval requests against
 * the defined validation schema. It ensures that album ID is properly formatted before proceeding.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates album parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetAlbum = async (req, _res, next) => {
	await validateSchema(req.params, getAlbumParamsSchema);
	next();
};

/**
 * Validates the request body for updating an existing album.
 *
 * This middleware validates the request body for album update requests against
 * the defined validation schema. It ensures that all required fields are present and meet criteria.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates album update body with proper schema checking explaining the complete validation process flow
 */
export const validateUpdateAlbum = async (req, _res, next) => {
	await validateSchema(req.body, createAlbumBodyValidationSchema);
	next();
};

/**
 * Validates query parameters for getting all albums.
 *
 * This middleware validates query parameters for album listing requests against
 * the defined validation schema. It ensures that search queries and pagination parameters
 * meet the specified criteria before proceeding with album retrieval.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates query parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetAllAlbums = async (req, _res, next) => {
	await validateSchema(req.query, getAllAlbumsQuerySchema);
	next();
};

/**
 * Album validation middleware module.
 * Provides middleware functions for validating album-related request data.
 */

import { createAlbumBodyValidationSchema } from "../models/validation-schemas/album.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates the request body for creating a new album.
 * Ensures songs field is always an array, even when a single song is provided.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing album data
 * @param {string|string[]} req.body.songs - Song ID(s) to include in the album
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateCreateAlbum = async (req, _res, next) => {
    if (typeof req.body.songs === "string") req.body.songs = [req.body.songs];
    await validateSchema(req.body, createAlbumBodyValidationSchema);
    next();
};

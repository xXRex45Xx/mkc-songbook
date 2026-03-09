/**
 * File upload middleware module.
 * Provides middleware functions for handling different types of file uploads using multer.
 * Configuration options for each upload type are defined in multer.config.js.
 */

import multer from "multer";
import {
    albumImageOpts,
    audioOpts,
    userImageOpts,
} from "../config/multer.config.js";

/**
 * Middleware for handling user profile image uploads.
 *
 * This middleware configures multer to handle user profile image uploads with specific validation rules
 * and storage settings. It supports file size limits, file type restrictions, and destination directories.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Handles user image upload with proper validation and storage processing explaining the complete file handling workflow
 */
export const userImageUpload = multer(userImageOpts);

/**
 * Middleware for handling album cover image uploads.
 *
 * This middleware configures multer to handle album cover image uploads with specific validation rules
 * and storage settings. It supports file size limits, file type restrictions, and destination directories.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Handles album image upload with proper validation and storage processing explaining the complete file handling workflow
 */
export const albumImageUpload = multer(albumImageOpts);

/**
 * Middleware for handling audio file uploads.
 *
 * This middleware configures multer to handle audio file uploads with specific validation rules
 * and storage settings. It supports file size limits, file type restrictions, and destination directories.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Handles audio file upload with proper validation and storage processing explaining the complete file handling workflow
 */
export const audioUpload = multer(audioOpts);

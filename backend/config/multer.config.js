/**
 * Multer Configuration
 *
 * This module configures Multer for handling file uploads in the application.
 * It provides:
 * 1. File storage configuration (local)
 * 2. File filtering and validation
 * 3. Upload limits and error handling
 *
 * @module multer.config
 */

import multer from "multer";
import { ClientFaultError } from "../utils/error.util.js";
import {
	AUDIO_MIMETYPE_MAP,
	IMAGE_MIMETYPE_MAP,
} from "../utils/mime-type-to-ext.util.js";
import { v1 } from "uuid";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config();

/**
 * Configuration for user profile image uploads
 *
 * This configuration handles user profile image uploads with:
 * 1. Local disk storage for images
 * 2. File size limits (30MB max)
 * 3. Image format validation
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.user._id - Unique identifier of the user requesting upload
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message and file details explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 */
export const userImageOpts = {
	storage: multer.diskStorage({
		destination: path.join(process.cwd(), process.env.IMAGE_STORAGE + "/users"),
		filename: (req, file, cb) => {
			const userId = req.user._id;
			const fileExt = IMAGE_MIMETYPE_MAP[file.mimetype];
			cb(null, `${userId}.${fileExt}`);
		},
	}),
	limits: { fileSize: 30 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (!IMAGE_MIMETYPE_MAP[file.mimetype])
			return cb(new ClientFaultError("Unsupported image format."), false);
		cb(null, true);
	},
};

/**
 * Configuration for album cover image uploads
 *
 * This configuration handles album cover image uploads with:
 * 1. Local disk storage for images
 * 2. File size limits (30MB max)
 * 3. Image format validation
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.user._id - Unique identifier of the user requesting upload
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message and file details explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 */
export const albumImageOpts = {
	storage: multer.diskStorage({
		destination: path.join(
			process.cwd(),
			process.env.IMAGE_STORAGE + "/albums"
		),
		filename: (_req, file, cb) => {
			const fileExt = IMAGE_MIMETYPE_MAP[file.mimetype];
			cb(null, `${v1()}.${fileExt}`);
		},
	}),
	limits: { fileSize: 30 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (!IMAGE_MIMETYPE_MAP[file.mimetype])
			return cb(new ClientFaultError("Unsupported image format."), false);
		cb(null, true);
	},
};

/**
 * Configuration for audio file uploads
 *
 * This configuration handles audio file uploads with:
 * 1. Local disk storage for audio files
 * 2. File size limits (50MB max)
 * 3. Audio format validation
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.user._id - Unique identifier of the user requesting upload
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message and file details explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 */
export const audioOpts = {
	storage: multer.diskStorage({
		destination: path.join(process.cwd(), process.env.AUDIO_STORAGE),
		filename: (_req, file, cb) => {
			const fileExt = AUDIO_MIMETYPE_MAP[file.mimetype];
			cb(null, `${v1()}.${fileExt}`);
		},
	}),
	limits: { fileSize: 50 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (!AUDIO_MIMETYPE_MAP[file.mimetype])
			return cb(new ClientFaultError("Unsupported audio format."), false);
		cb(null, true);
	},
};

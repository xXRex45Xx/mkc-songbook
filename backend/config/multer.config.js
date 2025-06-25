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
 * @type {Object}
 * @property {Object} storage - Disk storage configuration
 * @property {number} limits.fileSize - Maximum file size (30MB)
 * @property {Function} fileFilter - File type validation
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
 * @type {Object}
 * @property {Object} storage - Disk storage configuration
 * @property {number} limits.fileSize - Maximum file size (30MB)
 * @property {Function} fileFilter - File type validation
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
 * @type {Object}
 * @property {Object} storage - Disk storage configuration
 * @property {number} limits.fileSize - Maximum file size (50MB)
 * @property {Function} fileFilter - File type validation
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

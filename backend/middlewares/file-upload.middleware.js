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
 * Uses multer with specific configuration for user images.
 */
export const userImageUpload = multer(userImageOpts);

/**
 * Middleware for handling album cover image uploads.
 * Uses multer with specific configuration for album images.
 */
export const albumImageUpload = multer(albumImageOpts);

/**
 * Middleware for handling audio file uploads.
 * Uses multer with specific configuration for audio files.
 */
export const audioUpload = multer(audioOpts);

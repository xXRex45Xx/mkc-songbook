/**
 * Album Routes Module.
 * Handles all album-related routes including creation and listing.
 * Some routes require authentication and admin privileges.
 * @module routes/album
 */

import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import {
    addAlbum,
    getAllOrSearchAlbums,
    getAlbum,
    updateAlbum,
} from "../controllers/album.controller.js";
import { albumImageUpload } from "../middlewares/file-upload.middleware.js";
import {
    validateCreateAlbum,
    validateGetAlbum,
    validateUpdateAlbum,
} from "../middlewares/album-validation.middleware.js";
import {
    checkAlbumExists,
    checkAlbumExistsForUpdate,
    checkSongExists,
} from "../middlewares/pre-add-album.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";

/**
 * Express router instance for album routes.
 * All routes are prefixed with '/api/album'
 * @type {Router}
 */
const albumRouter = Router();

/**
 * Routes for /api/album
 * Handles album listing and creation
 */
albumRouter
    .route("/")
    /**
     * GET /api/album
     * Get all albums or search albums.
     * @route GET /api/album
     * @returns {Object[]} Array of album objects
     */
    .get(wrapAsync(getAllOrSearchAlbums))
    /**
     * POST /api/album
     * Create a new album. Requires admin privileges.
     * @route POST /api/album
     * @security JWT
     * @middleware passport.authenticate - Validates JWT token
     * @middleware roleBasedAuthorization - Ensures user is admin
     * @middleware albumImageUpload - Handles album cover image upload
     * @middleware validateCreateAlbum - Validates album data
     * @middleware checkAlbumExists - Prevents duplicate album IDs
     * @middleware checkSongExists - Validates song references
     * @body {Object} body - Album data
     * @body {string} body.id - Unique album ID
     * @body {string} body.title - Album title
     * @body {string[]} body.songs - Array of song IDs
     * @body {File} [body.cover] - Album cover image file
     */
    .post(
        passport.authenticate("jwt", { session: false }),
        wrapAsync(roleBasedAuthorization(["admin"])),
        albumImageUpload.single("cover"),
        wrapAsync(validateCreateAlbum),
        wrapAsync(checkAlbumExists),
        wrapAsync(checkSongExists),
        wrapAsync(addAlbum)
    );

albumRouter
    .route("/:id")
    .get(wrapAsync(validateGetAlbum), wrapAsync(getAlbum))
    .put(
        passport.authenticate("jwt", { session: false }),
        wrapAsync(roleBasedAuthorization(["admin"])),
        albumImageUpload.single("cover"),
        wrapAsync(validateUpdateAlbum),
        wrapAsync(checkAlbumExistsForUpdate),
        wrapAsync(checkSongExists),
        wrapAsync(updateAlbum)
    )
    .delete();

export default albumRouter;

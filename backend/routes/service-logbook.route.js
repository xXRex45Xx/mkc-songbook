/**
 * Service Logbook Routes Module.
 * Handles all service logbook-related routes including creation, listing and search.
 * Some routes require authentication and admin privileges.
 * @module routes/service-logbook
 */

import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import {
	addLog,
	getAllOrSearchLogBook,
} from "../controllers/service-logbook.controller.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";
import {
	validateCreateLogBook,
	validateGetAllLogBooks,
} from "../middlewares/service-logbook-validation.middleware.js";
import { checkSongExists } from "../middlewares/pre-add-album.middleware.js";

/**
 * Express router instance for service logbook routes.
 * All routes are prefixed with '/api/logbook'
 * @type {Router}
 */
const logBookRouter = Router();

/**
 * Routes for /api/logbook.
 * Handles protected logbook listing and privileged logbook creation.
 */
logBookRouter
	.route("/")
	/**
	 * Get all logbook entries or search logbook entries.
	 *
	 * Retrieves paginated service logbook entries for authenticated members, admins, and
	 * super-admins.
	 *
	 * @param {Object} req - Express request object containing query parameters
	 * @param {string} [req.query.q] - Search query string used with a matching search type
	 * @param {number} [req.query.page] - Page number for paginated results
	 * @param {string} [req.query.type] - Search type used to match service date, location, id, or all fields
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with logbook entries and pagination metadata
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to view logbook entries
	 * @throws {ClientFaultError} If query parameters fail validation
	 * @throws {NotFoundError} If no logbook entries match the provided criteria
	 * @throws {ServerFaultError} If the logbook query fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/logbook?q=Mark&type=location&page=1
	 * This example demonstrates searching for logbook entries by location.
	 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["member", "admin", "super-admin"])),
		wrapAsync(validateGetAllLogBooks),
		wrapAsync(getAllOrSearchLogBook)
	)
	/**
	 * Create a new logbook entry.
	 *
	 * Creates a service logbook entry after validating the request payload and confirming that all
	 * referenced songs exist. This route requires an authenticated admin or super-admin user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.location - Church or venue name stored on the logbook entry
	 * @param {string} req.body.timestamp - Service date and time used to create the logbook entry
	 * @param {string[]} req.body.songs - Song ids attached to the logbook entry
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the inserted logbook id
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to create logbook entries
	 * @throws {ClientFaultError} If the request body fails validation
	 * @throws {NotFoundError} If one of the referenced songs cannot be found
	 * @throws {ServerFaultError} If the logbook entry cannot be created
	 * @example
	 * // Example usage:
	 * POST /api/logbook
	 * {
	 *   "location": "Saint Mark",
	 *   "timestamp": "2026-03-15T10:00:00.000Z",
	 *   "songs": ["song-456"]
	 * }
	 * This example demonstrates creating a new logbook entry.
	 */
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateCreateLogBook),
		wrapAsync(checkSongExists),
		wrapAsync(addLog)
	);

export default logBookRouter;

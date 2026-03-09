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
 * Routes for /api/logbook
 * Handles logbook listing and creation
 *
 * This route creates a new logbook entry in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid logbook data,
 * including service date, songs, and associated songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.serviceDate - Service date (required) with explanation of format validation and content constraints
 * @param {string[]} req.body.songs - Array of song IDs this logbook entry contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/logbook
 * {
 *   "serviceDate": "2026-03-15",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates creating a new logbook entry.
 */
logBookRouter
	.route("/")
	/**
	 * GET /api/logbook
	 * Get all logbook entries or search logbook entries.
	 *
	 * This function retrieves logbook entries from the database based on specified criteria.
	 * It supports searching by service date, ID, and other attributes with pagination support
	 * for efficient data retrieval. The function handles various search types and sorting options
	 * to provide flexible access to data.
	 *
	 * @param {Object} req - Express request object containing query parameters
 * @property {string} [req.query.q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [req.query.page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {string} [req.query.type] - Search type (optional) with description of available search modes and their behavior
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with logbook entries and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no logbook entries match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/logbook?q=2026-03-15&sortBy=A-Z&page=1
 * This example demonstrates searching for logbook entries by service date.
 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["member", "admin", "super-admin"])),
		wrapAsync(validateGetAllLogBooks),
		wrapAsync(getAllOrSearchLogBook)
	)
	/**
	 * POST /api/logbook
	 * Create a new logbook entry. Requires admin privileges.
	 *
	 * This function creates a new logbook entity in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the created entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.serviceDate - Service date (required) with explanation of format validation and content constraints
 * @property {string[]} req.body.songs - Array of song IDs this logbook entry contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/logbook
 * {
 *   "serviceDate": "2026-03-15",
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

/**
 * Routes for /api/logbook/:id
 * Handles operations on specific logbook entries
 *
 * This route updates an existing logbook entry in the database. It requires authentication
 * and admin privileges to access. The request body must contain valid logbook data,
 * including service date, songs, and associated songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.serviceDate - Service date (required) with explanation of format validation and content constraints
 * @param {string[]} req.body.songs - Array of song IDs this logbook entry contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated logbook data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/logbook/logbook-123
 * {
 *   "serviceDate": "2026-03-15",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates updating a logbook entry.
 */
logBookRouter
	.route("/:id")
	/**
	 * PUT /api/logbook/:id
	 * Update a specific logbook entry. Requires admin privileges.
	 *
	 * This function updates an existing logbook entry in the database by processing the provided data.
	 * It validates the input parameters, checks for duplicates or constraints, and stores the entity
	 * in the database. The function returns information about the updated entity for confirmation.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.serviceDate - Service date (required) with explanation of format validation and content constraints
 * @property {string[]} req.body.songs - Array of song IDs this logbook entry contains (required) with explanation of relationship mapping and constraint validation
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated logbook data and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PUT /api/logbook/logbook-123
 * {
 *   "serviceDate": "2026-03-15",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates updating a logbook entry.
 */
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateCreateLogBook),
		wrapAsync(checkSongExists),
		wrapAsync(addLog)
	);

export default logBookRouter;

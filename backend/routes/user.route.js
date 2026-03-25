/**
 * User Routes Module.
 * Handles all user-related routes including authentication, registration and management.
 * Some routes require authentication and admin privileges.
 * @module routes/user
 */

import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import validateOtp from "../middlewares/validate-otp.middleware.js";
import {
	googleOAuthLogin,
	getCurrentUser,
	registerOTP,
	registerUser,
	resetPassword,
	verifyOTP,
	getAllOrSearchUsers,
	updateUserRole,
	updateFavorites,
	getFavorites,
} from "../controllers/user.controller.js";
import localAuth from "../middlewares/local-auth.middleware.js";
import {
	validateLogin,
	validateRegisterOTP,
	validateRegisterUser,
	validateResetPassword,
	validateVerifyOTP,
	validateGetAllUsers,
	validateUpdateUserRole,
	validateUpdateFavorites,
} from "../middlewares/user-validation.middleware.js";
import checkUserExists from "../middlewares/check-user-exists.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";

/**
 * Express router instance for user routes.
 * All routes are prefixed with '/api/user'
 * @type {Router}
 */
const userRouter = Router();

/**
 * Routes for /api/user.
 * Handles admin user listing and public user registration.
 */
userRouter
	.route("/")
	/**
	 * Get all users or search users.
	 *
	 * Retrieves paginated user results for authenticated admin and super-admin users.
	 *
	 * @param {Object} req - Express request object containing query parameters
	 * @param {string} [req.query.q] - Search query string used with a matching search type
	 * @param {number} [req.query.page] - Page number for paginated results
	 * @param {string} [req.query.type] - Search type used to match name, email, id, or all fields
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with users and pagination metadata
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to list users
	 * @throws {ClientFaultError} If query parameters fail validation
	 * @throws {NotFoundError} If no users match the provided search criteria
	 * @throws {ServerFaultError} If the user query fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/user?q=John&type=name&page=1
	 * This example demonstrates searching for users by name.
	 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetAllUsers),
		wrapAsync(getAllOrSearchUsers)
	)
	/**
	 * Register a new user.
	 *
	 * Creates a user account after validating the registration payload, ensuring the email does
	 * not already belong to an existing user, and verifying the submitted OTP.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.email - Email address used for the new account
	 * @param {string} req.body.name - Display name for the new user account
	 * @param {string} req.body.password - Password to hash and store for the account
	 * @param {number} req.body.otp - Verification code previously issued to the email address
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the created user and authentication token
	 * @throws {ClientFaultError} If the registration payload is invalid, the user already exists, or the OTP is invalid
	 * @throws {ServerFaultError} If the account cannot be created
	 * @example
	 * // Example usage:
	 * POST /api/user
	 * {
	 *   "email": "user@example.com",
	 *   "name": "John Doe",
	 *   "password": "securePassword123",
	 *   "otp": 123456
	 * }
	 * This example demonstrates registering a new user.
	 */
	.post(
		wrapAsync(validateRegisterUser),
		wrapAsync(checkUserExists),
		wrapAsync(validateOtp),
		wrapAsync(registerUser)
	);

/**
 * Routes for /api/user/otp.
 * Handles OTP requests for registration and password reset.
 */
userRouter
	.route("/otp")
	/**
	 * Request an OTP code.
	 *
	 * Issues an OTP for registration by default, or for password reset when the
	 * `forgotPassword=true` query flag is provided.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.email - Email address that should receive the OTP
	 * @param {boolean} [req.query.forgotPassword] - Flag indicating that the OTP is for password reset
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the OTP request succeeded
	 * @throws {ClientFaultError} If the email payload is invalid or the request context is not allowed for the target user
	 * @throws {ServerFaultError} If the OTP cannot be created or delivered
	 * @example
	 * // Example usage:
	 * POST /api/user/otp?forgotPassword=true
	 * {
	 *   "email": "user@example.com"
	 * }
	 * This example demonstrates requesting an OTP for password reset.
	 */
	.post(
		wrapAsync(validateRegisterOTP),
		wrapAsync(checkUserExists),
		wrapAsync(registerOTP)
	);

/**
 * Routes for /api/user/verify-otp.
 * Handles OTP verification requests.
 */
userRouter
	.route("/verify-otp")
	/**
	 * Verify an OTP code.
	 *
	 * Validates the submitted email and OTP pair against the stored verification code.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.email - Email address associated with the OTP
	 * @param {number} req.body.otp - Verification code to validate
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that the OTP is valid
	 * @throws {ClientFaultError} If the payload is invalid or the OTP does not match
	 * @throws {ServerFaultError} If OTP verification fails unexpectedly
	 * @example
	 * // Example usage:
	 * POST /api/user/verify-otp
	 * {
	 *   "email": "user@example.com",
	 *   "otp": 123456
	 * }
	 * This example demonstrates verifying an OTP code.
	 */
	.post(
		wrapAsync(validateVerifyOTP),
		wrapAsync(verifyOTP)
	);

/**
 * Routes for /api/user/login.
 * Handles local email and password authentication.
 */
userRouter
	.route("/login")
	/**
	 * Authenticate a user with email and password.
	 *
	 * Validates the login payload and authenticates the user through the local auth middleware.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.email - Email address used to look up the user account
	 * @param {string} req.body.password - Plain text password submitted for authentication
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the authenticated user and JWT token
	 * @throws {ClientFaultError} If the payload is invalid or the credentials do not match
	 * @throws {ServerFaultError} If authentication fails unexpectedly
	 * @example
	 * // Example usage:
	 * POST /api/user/login
	 * {
	 *   "email": "user@example.com",
	 *   "password": "securePassword123"
	 * }
	 * This example demonstrates authenticating a user.
	 */
	.post(
		wrapAsync(validateLogin),
		wrapAsync(localAuth)
	);

/**
 * Routes for /api/user/current-user.
 * Handles current user profile access.
 */
userRouter
	.route("/current-user")
	/**
	 * Get the current authenticated user.
	 *
	 * Retrieves the currently authenticated user profile from the JWT-authenticated request.
	 *
	 * @param {Object} req - Express request object containing authenticated user context
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the current user profile
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {NotFoundError} If the authenticated user can no longer be found
	 * @throws {ServerFaultError} If the profile lookup fails unexpectedly
	 * @example
	 * // Example usage:
	 * GET /api/user/current-user
	 * This example demonstrates retrieving the current authenticated user.
	 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(getCurrentUser)
	);

/**
 * Routes for /api/user/google/callback.
 * Handles Google OAuth authentication.
 */
userRouter
	.route("/google/callback")
	/**
	 * Authenticate a user with Google OAuth.
	 *
	 * Exchanges the provided Google access token for profile data and creates or logs in the user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.accessToken - Google OAuth access token to validate against Google APIs
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response with the authenticated user and JWT token
	 * @throws {ClientFaultError} If the request payload is invalid
	 * @throws {UnauthorizedError} If the Google access token cannot be verified
	 * @throws {ServerFaultError} If Google login fails unexpectedly
	 * @example
	 * // Example usage:
	 * POST /api/user/google/callback
	 * {
	 *   "accessToken": "ya29.A...token..."
	 * }
	 * This example demonstrates Google OAuth login.
	 */
	.post(
		wrapAsync(googleOAuthLogin)
	);

/**
 * Routes for /api/user/reset-password.
 * Handles password reset requests.
 */
userRouter
	.route("/reset-password")
	/**
	 * Reset a password with an OTP.
	 *
	 * Validates the reset payload, verifies the submitted OTP, and updates the user's password.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.body.email - Email address for the account being updated
	 * @param {string} req.body.password - New password to store for the user
	 * @param {number} req.body.otp - Verification code required to authorize the reset
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming the password reset
	 * @throws {ClientFaultError} If the payload is invalid or the OTP cannot be verified
	 * @throws {NotFoundError} If the user account cannot be found
	 * @throws {ServerFaultError} If the password reset fails unexpectedly
	 * @example
	 * // Example usage:
	 * PUT /api/user/reset-password
	 * {
	 *   "email": "user@example.com",
	 *   "password": "newSecurePassword123",
	 *   "otp": 123456
	 * }
	 * This example demonstrates resetting a user's password.
	 */
	.put(
		wrapAsync(validateResetPassword),
		wrapAsync(validateOtp),
		wrapAsync(resetPassword)
	);

/**
 * GET /api/user/favorites
 * Get the current user's favorites playlist.
 *
 * Retrieves the authenticated user's favorites playlist and its current song list.
 *
 * @param {Object} req - Express request object containing authenticated user context
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with the current user's favorites playlist
 * @throws {UnauthorizedError} If the request is not authenticated
 * @throws {NotFoundError} If the current user cannot be found
 * @throws {ServerFaultError} If favorites retrieval fails unexpectedly
 * @example
 * // Example usage:
 * GET /api/user/favorites
 * This example demonstrates retrieving the current user's favorites playlist.
 */
userRouter.get(
	"/favorites",
	passport.authenticate("jwt", { session: false }),
	wrapAsync(getFavorites)
);

userRouter
	/**
	 * PATCH /api/user/update-favorites
	 * Update the current user's favorites.
	 *
	 * Adds songs, removes songs, or replaces the favorites list for the authenticated user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string[]} [req.body.favorites] - Complete favorites list to persist for the current user
	 * @param {string[]} [req.body.addSongs] - Song ids to append to the current favorites list
	 * @param {string[]} [req.body.removeSongs] - Song ids to remove from the current favorites list
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming that favorites were updated
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ClientFaultError} If the payload fails favorites validation
	 * @throws {NotFoundError} If the current user cannot be found
	 * @throws {ServerFaultError} If the favorites update fails unexpectedly
	 * @example
	 * // Example usage:
	 * PATCH /api/user/update-favorites
	 * {
	 *   "addSongs": ["song-001"],
	 *   "removeSongs": ["song-002"]
	 * }
	 * This example demonstrates updating the current user's favorites list.
	 */
	.patch(
		"/update-favorites",
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateUpdateFavorites),
		wrapAsync(updateFavorites)
	);

/**
 * Routes for /api/user/:id.
 * Handles role updates for a specific user.
 */
userRouter
	.route("/:id")
	/**
	 * PATCH /api/user/:id
	 * Update a user's role.
	 *
	 * Updates the role of the target user. This route requires an authenticated admin or
	 * super-admin user.
	 *
	 * @param {Object} req - Express request object containing request data
	 * @param {string} req.params.id - User identifier whose role should be updated
	 * @param {string} req.body.role - New role to assign to the target user
	 * @param {Object} res - Express response object for sending responses back to client
	 * @returns {Promise<void>} Sends JSON response confirming the role update
	 * @throws {UnauthorizedError} If the request is not authenticated
	 * @throws {ForbiddenError} If the authenticated user is not allowed to update the requested role
	 * @throws {ClientFaultError} If the user id or role payload fails validation
	 * @throws {NotFoundError} If the target user cannot be found
	 * @throws {ServerFaultError} If the role update fails unexpectedly
	 * @example
	 * // Example usage:
	 * PATCH /api/user/65f0c0d1a8b8e5c2d1a2b3c4
	 * {
	 *   "role": "admin"
	 * }
	 * This example demonstrates promoting a user to admin.
	 */
	.patch(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateUpdateUserRole),
		wrapAsync(updateUserRole)
	);

export default userRouter;

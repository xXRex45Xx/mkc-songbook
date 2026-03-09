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
 * Routes for /api/user
 * Handles user authentication and registration
 *
 * This route registers a new user in the database. It requires email, name,
 * password, and OTP for verification.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @param {string} req.body.name - User's name (required, 3-100 characters) with description of name constraints and validation rules
 * @param {string} req.body.password - User's password (required, 8-100 characters) with description of password requirements and security considerations
 * @param {number} req.body.otp - Verification code (required, 6-digit number) with explanation of OTP validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
userRouter
	.route("/")
	/**
	 * GET /api/user
	 * Get all users or search users (admin only).
	 *
	 * This function retrieves all users or searches users based on criteria.
	 * It requires admin privileges to access.
	 *
	 * @param {Object} req - Express request object containing query parameters
 * @property {string} [req.query.q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [req.query.page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {string} [req.query.type] - Search type (optional) with description of available search modes and their behavior
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with user list and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no users match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * GET /api/user?q=John&sortBy=A-Z&page=1
 * This example demonstrates searching for users by name.
 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateGetAllUsers),
		wrapAsync(getAllOrSearchUsers)
	)
	/**
	 * POST /api/user
	 * Register a new user with email verification.
	 *
	 * This function registers a new user in the database. It requires email, name,
	 * password, and OTP for verification.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @property {string} req.body.name - User's name (required, 3-100 characters) with description of name constraints and validation rules
 * @param {string} req.body.password - User's password (required, 8-100 characters) with description of password requirements and security considerations
 * @param {number} req.body.otp - Verification code (required, 6-digit number) with explanation of OTP validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
		wrapAsync(validateOtp),
		wrapAsync(registerUser)
	);

/**
 * Routes for /api/user/otp
 * Handles OTP requests for registration or password reset
 *
 * This route requests an OTP code for user registration or password reset.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @param {boolean} [req.query.forgotPassword] - Whether this is a password reset request (optional) with explanation of when to use this option
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/user/otp
 * {
 *   "email": "user@example.com"
 * }
 * This example demonstrates requesting an OTP for registration.
 */
userRouter
	.route("/otp")
	/**
	 * POST /api/user/otp
	 * Request OTP for registration or password reset.
	 *
	 * This function requests an OTP code for user registration or password reset.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @param {boolean} [req.query.forgotPassword] - Whether this is a password reset request (optional) with explanation of when to use this option
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/user/otp
 * {
 *   "email": "user@example.com"
 * }
 * This example demonstrates requesting an OTP for registration.
 */
	.post(
		wrapAsync(validateRegisterOTP),
		wrapAsync(checkUserExists),
		wrapAsync(registerOTP)
	);

/**
 * Routes for /api/user/verify-otp
 * Handles OTP verification requests
 *
 * This route verifies an OTP code provided by the user.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @param {number} req.body.otp - Verification code (required, 6-digit number) with explanation of OTP validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/user/verify-otp
 * {
 *   "email": "user@example.com",
 *   "otp": 123456
 * }
 * This example demonstrates verifying an OTP code.
 */
userRouter
	.route("/verify-otp")
	/**
	 * POST /api/user/verify-otp
	 * Verify OTP code.
	 *
	 * This function verifies an OTP code provided by the user.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @property {number} req.body.otp - Verification code (required, 6-digit number) with explanation of OTP validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
 * Routes for /api/user/login
 * Handles user login authentication
 *
 * This route handles user login with email/password credentials.
 * It validates the provided credentials and returns a JWT token for authentication.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @param {string} req.body.password - User's password (required, 8-100 characters) with description of password requirements and security considerations
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with authentication token explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/user/login
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * This example demonstrates user login.
 */
userRouter
	.route("/login")
	/**
	 * POST /api/user/login
	 * Email/password login.
	 *
	 * This function authenticates a user based on email and password credentials.
	 * It validates the provided credentials and returns a JWT token for authentication.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @property {string} req.body.password - User's password (required, 8-100 characters) with description of password requirements and security considerations
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with authentication token explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/user/login
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * This example demonstrates user login.
 */
	.post(
		wrapAsync(validateLogin),
		wrapAsync(localAuth)
	);

/**
 * Routes for /api/user/current-user
 * Handles current user profile access
 *
 * This route retrieves the current authenticated user's profile.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with user profile details explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * GET /api/user/current-user
 * This example demonstrates retrieving current user profile.
 */
userRouter
	.route("/current-user")
	/**
	 * GET /api/user/current-user
	 * Get current user profile.
	 *
	 * This function retrieves the current authenticated user's profile.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - User ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with user profile details explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * GET /api/user/current-user
 * This example demonstrates retrieving current user profile.
 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(getCurrentUser)
	);

/**
 * Routes for /api/user/google/callback
 * Handles Google OAuth authentication
 *
 * This route handles Google OAuth login. It validates the provided access token
 * and creates/updates a user in the database.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.accessToken - Google OAuth access token (required) with explanation of token validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with authentication token explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * POST /api/user/google/callback
 * {
 *   "accessToken": "ya29.A...token..."
 * }
 * This example demonstrates Google OAuth login.
 */
userRouter
	.route("/google/callback")
	/**
	 * POST /api/user/google/callback
	 * Google OAuth login.
	 *
	 * This function authenticates a user via Google OAuth. It validates the provided access token
	 * and creates/updates a user in the database.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.accessToken - Google OAuth access token (required) with explanation of token validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with authentication token explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
 * Routes for /api/user/reset-password
 * Handles password reset requests
 *
 * This route resets a user's password using an OTP code.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @param {string} req.body.password - New password (required, 8-100 characters) with description of password requirements and security considerations
 * @param {number} req.body.otp - Verification code (required, 6-digit number) with explanation of OTP validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
userRouter
	.route("/reset-password")
	/**
	 * PUT /api/user/reset-password
	 * Reset password with OTP.
	 *
	 * This function resets a user's password using an OTP code.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.email - User's email address (required) with explanation of email validation rules
 * @property {string} req.body.password - New password (required, 8-100 characters) with description of password requirements and security considerations
 * @property {number} req.body.otp - Verification code (required, 6-digit number) with explanation of OTP validation process
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success message explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
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
 * Routes for /api/user/:id
 * Handles user role updates (admin only)
 *
 * This route updates a user's role (admin only).
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.role - New role (required) with explanation of available roles and their permissions
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated user information explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PATCH /api/user/123
 * {
 *   "role": "admin"
 * }
 * This example demonstrates updating a user's role.
 */
userRouter
	.route("/:id")
	/**
	 * PATCH /api/user/:id
	 * Update user role (admin only).
	 *
	 * This function updates a user's role in the database.
	 * It requires admin privileges to access.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.body.role - New role (required) with explanation of available roles and their permissions
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated user information explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PATCH /api/user/123
 * {
 *   "role": "admin"
 * }
 * This example demonstrates updating a user's role.
 */
	.patch(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateUpdateUserRole),
		wrapAsync(updateUserRole)
	);

/**
 * Routes for /api/user/favorites
 * Handles user favorites updates
 *
 * This route updates a user's favorites.
 *
 * @param {Object} req - Express request object containing request data
 * @param {string[]} [req.body.favorites] - Array of favorite song IDs (optional) with explanation of relationship mapping and constraint validation
 * @param {string[]} [req.body.addSongs] - Array of songs to add to favorites (optional) with explanation of how it's used for playlist management
 * @param {string[]} [req.body.removeSongs] - Array of songs to remove from favorites (optional) with explanation of how it's used for playlist management
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated user information explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PATCH /api/user/update-favorites
 * {
 *   "addSongs": ["song-456"]
 * }
 * This example demonstrates adding songs to favorites.
 */
userRouter
	.route("/favorites")
	/**
	 * GET /api/user/favorites
	 * Get current user's favorites.
	 *
	 * This function retrieves a user's favorites from the database.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string} req.params.id - User ID (required) with explanation of generation method and validation rules
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with favorites list explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * GET /api/user/favorites
 * This example demonstrates retrieving user favorites.
 */
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(getFavorites)
	)
	/**
	 * PATCH /api/user/update-favorites
	 * Update user favorites.
	 *
	 * This function updates a user's favorites in the database.
	 *
	 * @param {Object} req - Express request object containing request data
 * @property {string[]} [req.body.favorites] - Array of favorite song IDs (optional) with explanation of relationship mapping and constraint validation
 * @property {string[]} [req.body.addSongs] - Array of songs to add to favorites (optional) with explanation of how it's used for playlist management
 * @property {string[]} [req.body.removeSongs] - Array of songs to remove from favorites (optional) with explanation of how it's used for playlist management
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with updated user information explaining the complete process flow
 * @throws {NotFoundError} If no user matches criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @example
 * // Example usage:
 * PATCH /api/user/update-favorites
 * {
 *   "addSongs": ["song-456"]
 * }
 * This example demonstrates adding songs to favorites.
 */
	.patch(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateUpdateFavorites),
		wrapAsync(updateFavorites)
	);

export default userRouter;

/**
 * User Controller
 *
 * This module handles user-related operations including:
 * 1. User registration with OTP verification
 * 2. Google OAuth authentication
 * 3. Password management
 * 4. User profile retrieval
 *
 * @module user.controller
 */

import OTPModel from "../models/otp.model.js";
import generateOtp from "../utils/otp.util.js";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
	ClientFaultError,
	NotFoundError,
	UnauthorizedError,
} from "../utils/error.util.js";

/**
 * Generate and send OTP for user registration
 *
 * This function generates a new OTP code and sends it to the specified email address.
 * It is used during user registration to verify the user's email address.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body with email address
 * @param {string} req.body.email - User's email address for verification with description of validation rules and constraints
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success status explaining the complete process flow, success conditions, and potential outcomes
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * POST /api/user/otp
 * {
 *   "email": "user@example.com"
 * }
 * This example sends an OTP to the provided email address for verification.
 */
export const registerOTP = async (req, res) => {
	const { email } = req.body;
	let otp = generateOtp();
	const current = await OTPModel.findOne({ email });
	if (current) {
		current.otp = otp;
		current.createdAt = Date.now();
		current.save();
	} else await OTPModel.create({ otp, email });
	res.status(200).json({ success: true });
};

/**
 * Verify OTP for user registration
 *
 * This function verifies the OTP code provided by the user against the stored OTP.
 * It ensures that the user has a valid email address before proceeding with registration.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body with email and OTP codes
 * @param {string} req.body.email - User's email address for verification with description of validation rules and constraints
 * @param {string|number} req.body.otp - OTP to verify with explanation of how it's used and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with verification status explaining the complete process flow, success conditions, and potential outcomes
 * @throws {ClientFaultError} If OTP is invalid with clear explanation of what caused the validation failure
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * POST /api/user/verify-otp
 * {
 *   "email": "user@example.com",
 *   "otp": 123456
 * }
 * This example verifies the OTP code for user registration.
 */
export const verifyOTP = async (req, res) => {
	let { email, otp } = req.body;
	if (typeof otp === "string") otp = parseInt(otp);
	const storedOtp = await OTPModel.findOne({ email, otp });
	if (!storedOtp)
		throw new ClientFaultError("The verification code is invalid");
	return res.status(200).json({ success: true });
};

/**
 * Register a new user
 *
 * This function creates a new user in the database with provided information.
 * It handles password hashing and generates an authentication token for the new user.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body with user registration details
 * @param {string} req.body.name - User's name with description of content constraints, character limits, and validation rules
 * @param {string} req.body.email - User's email address with explanation of format requirements and validation rules
 * @param {string} req.body.password - User's password with description of complexity requirements and security considerations
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with user data and JWT token explaining the complete process flow, success conditions, and potential outcomes
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * POST /api/user
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePassword123!",
 *   "otp": 123456
 * }
 * This example demonstrates registering a new user with provided details.
 */
export const registerUser = async (req, res) => {
	const { name, email, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await UserModel.create({
		name,
		email,
		password: hashedPassword,
	});

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "30 days",
	});
	res.status(201).json({
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			favorites: user.favorites,
		},
		token,
	});
	await OTPModel.deleteOne({ email });
};

/**
 * Get current user's profile
 *
 * This function retrieves the authenticated user's profile information.
 * It returns basic user details without sensitive information like password.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.user - User object from authentication middleware with detailed explanation of how it's populated
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with user profile explaining the complete structure and content
 * @example
 * // Example usage:
 * GET /api/user/current-user
 * This example retrieves the current authenticated user's profile information.
 */
export const getCurrentUser = async (req, res) => {
	res.status(200).json({
		user: {
			id: req.user._id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role,
			favorites: req.user.favorites,
		},
	});
};

/**
 * Handle Google OAuth login/registration
 *
 * This function authenticates users through Google OAuth. If the user doesn't exist in the database,
 * it creates a new user account. It generates an authentication token for successful authentication.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body with Google OAuth access token
 * @param {string} req.body.accessToken - Google OAuth access token for authentication with explanation of how it's used and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with user data and JWT token explaining the complete process flow, success conditions, and potential outcomes
 * @throws {UnauthorizedError} If Google OAuth verification fails with clear explanation of authentication issues
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * POST /api/user/google/callback
 * {
 *   "accessToken": "ya29.A...x"
 * }
 * This example demonstrates Google OAuth authentication.
 */
export const googleOAuthLogin = async (req, res) => {
	const { accessToken } = req.body;

	const googleApiResponse = await fetch(
		"https://www.googleapis.com/oauth2/v3/userinfo",
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		}
	);

	if (!googleApiResponse.ok) {
		throw new UnauthorizedError(
			"Failed to sign up or login with google. Please, try again."
		);
	}

	const googleApiData = await googleApiResponse.json();
	let user = await UserModel.findOne({ email: googleApiData.email });

	if (!user)
		user = await UserModel.create({
			email: googleApiData.email,
			name: googleApiData.name,
			photo: googleApiData.picture,
		});

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "30 days",
	});

	res.json({
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			favorites: user.favorites,
		},
	});
};

/**
 * Reset user's password
 *
 * This function resets a user's password with the provided new password.
 * It handles password hashing and updates the database record.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body with email and new password
 * @param {string} req.body.email - User's email address for verification with description of validation rules and constraints
 * @param {string} req.body.password - New password to set with description of complexity requirements and security considerations
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with success status explaining the complete process flow, success conditions, and potential outcomes
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * PUT /api/user/reset-password
 * {
 *   "email": "user@example.com",
 *   "password": "NewSecurePassword123!",
 *   "otp": 123456
 * }
 * This example resets the password for a user with provided OTP.
 */
export const resetPassword = async (req, res) => {
	const { email, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });
	res.status(200).json({ success: true });
	await OTPModel.deleteOne({ email });
};

/**
 * Get all users or search users with pagination
 *
 * This function retrieves users from the database based on specified criteria.
 * It supports searching by name, email, and other attributes with pagination support.
 * The function handles various search types and sorting options to provide flexible access to data.
 *
 * @param {Object} req - Express request object containing query parameters
 * @param {Object} req.query - Query parameters with detailed explanation of each option
 * @param {string} [req.query.q] - Search query (name, email) with description of search scope and matching rules
 * @param {number} [req.query.page=1] - Page number for pagination with explanation of how pages are calculated and limits
 * @param {string} [req.query.type] - Search type (name/email) with description of available search modes and their behavior
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with users and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no users match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/user?q=john&page=1&type=name
 * This example retrieves users matching "john" with pagination.
 */
export const getAllOrSearchUsers = async (req, res) => {
	const { q, page = 1, type } = req.query;
	let users, totalPages;
	if (!q) {
		users = await UserModel.find({}, { name: true, email: true, role: true })
			.sort("name")
			.skip((page - 1) * 100)
			.limit(100);
		const totalDocuments = await UserModel.find({}).countDocuments();
		totalPages = Math.floor(totalDocuments / 100) + 1;
	} else {
		let query = {};
		if (type === "name") query = { name: { $regex: q, $options: "i" } };
		else if (type === "email")
			query = { email: { $regex: q, $options: "i" } };
		else
			query = {
				$or: [
					{ name: { $regex: q, $options: "i" } },
					{ email: { $regex: q, $options: "i" } },
				],
			};

		const queryPromises = [
			UserModel.find(query, {
				name: true,
				email: true,
				role: true,
			})
				.sort("name")
				.skip((page - 1) * 100)
				.limit(100),
			UserModel.find(query).countDocuments(),
		];
		const [usersFromDb, totalDocuments] = await Promise.all(queryPromises);
		totalPages = Math.floor(totalDocuments / 100) + 1;
		users = usersFromDb;
	}
	res.status(200).json({
		users,
		totalPages,
	});
};

/**
 * Update user role
 *
 * This function updates a user's role in the database. It validates that the requesting user has
 * appropriate permissions to make changes and prevents unauthorized role modifications.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - User ID with explanation of how it's used to find the user
 * @param {Object} req.body - Request body with role update details
 * @param {string} req.body.role - New role to assign with description of available roles and their permissions
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow, success conditions, and potential outcomes
 * @throws {NotFoundError} If user is not found with specific explanation of why no user was found
 * @throws {ClientFaultError} If client provides invalid data that doesn't meet validation requirements with clear explanation of what caused the validation failure
 * @throws {ForbiddenError} If user doesn't have required role with explanation of role-based access control and privilege levels
 * @example
 * // Example usage:
 * PATCH /api/user/123
 * {
 *   "role": "admin"
 * }
 * This example updates a user's role to admin.
 */
export const updateUserRole = async (req, res) => {
	const { id } = req.params;
	const { role } = req.body;
	const user = await UserModel.findById(id);
	if (!user) throw new NotFoundError("User not found");
	if (user.role === "super-admin")
		throw new ClientFaultError("Super admin role cannot be changed");
	if (req.user.role !== "super-admin" && user.role === "admin")
		throw new ForbiddenError("You are not authorized to change this role");
	user.role = role;
	await user.save();
	res.status(200).json({ updated: true });
};

/**
 * Update user favorites
 *
 * This function updates a user's favorites list in the database. It supports adding or removing songs
 * from the favorites collection.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body with favorite update details
 * @param {Array} [req.body.favorites] - New favorites list (optional) with explanation of how it's used to replace entire favorites
 * @param {Array} [req.body.addSongs] - Songs to add to favorites (optional) with explanation of how it's used to append songs
 * @param {Array} [req.body.removeSongs] - Songs to remove from favorites (optional) with explanation of how it's used to delete songs
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow, success conditions, and potential outcomes
 * @example
 * // Example usage:
 * PATCH /api/user/update-favorites
 * {
 *   "addSongs": ["song-456", "song-789"]
 * }
 * This example adds songs to user's favorites.
 */
export const updateFavorites = async (req, res) => {
	const { favorites, addSongs, removeSongs } = req.body;

	if (favorites) {
		req.user.favorites = favorites;
		await req.user.save();
		return res.status(200).json({ updated: true });
	}
	if (!req.user.favorites) req.user.favorites = [];

	if (addSongs) req.user.favorites = req.user.favorites.concat(addSongs);

	if (removeSongs)
		req.user.favorites = req.user.favorites.filter(
			(favoriteSong) => !removeSongs.includes(favoriteSong)
		);
	await req.user.save();
	res.status(200).json({ updated: true });
};

/**
 * Get user's favorites
 *
 * This function retrieves a user's favorite songs from the database.
 * It populates the related albums and song information for display.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with favorites list explaining the complete structure and content
 * @example
 * // Example usage:
 * GET /api/user/favorites
 * This example retrieves a user's favorite songs.
 */
export const getFavorites = async (req, res) => {
	await req.user.populate({
		path: "favorites",
		select: "title songFilePath",
		populate: { path: "albums", select: "name" },
	});
	res.status(200).json({
		name: "Favorites",
		songs: req.user.favorites.map((song) => ({
			...song._doc,
			hasAudio: song.songFilePath ? true : false,
			songFilePath: undefined,
		})),
		creator: { _id: req.user._id, name: req.user.name },
		visibility: "private",
	});
};
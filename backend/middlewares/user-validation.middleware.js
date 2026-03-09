/**
 * User validation middleware module.
 * Provides middleware functions for validating user-related request data using validation schemas.
 */

import SongModel from "../models/song.model.js";
import {
	googleOAuthBodySchema,
	loginBodySchema,
	registerOTPBodySchema,
	registerOTPQuerySchema,
	registerUserBodySchema,
	resetPasswordBodySchema,
	verifyOTPBodySchema,
	getAllUsersQuerySchema,
	updateUserRoleParamsSchema,
	updateUserRoleBodySchema,
	updateFavoritesBodySchema,
} from "../models/validation-schemas/user.validaton-schema.js";
import { ClientFaultError } from "../utils/error.util.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates user registration request body data.
 *
 * This middleware validates the request body for user registration requests against
 * the defined validation schema. It ensures that all required fields are present and
 * meet the specified criteria before proceeding with user creation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates registration body with proper schema checking explaining the complete validation process flow
 */
export const validateRegisterUser = async (req, _res, next) => {
	await validateSchema(req.body, registerUserBodySchema);
	next();
};

/**
 * Validates OTP registration request body and query parameters.
 *
 * This middleware validates both the request body and query parameters for OTP registration requests.
 * It ensures that email is provided in the query and all required fields are present in the body
 * according to the validation schema before proceeding with OTP generation or verification.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates OTP registration body and query with proper schema checking explaining the complete validation process flow
 */
export const validateRegisterOTP = async (req, _res, next) => {
	await validateSchema(req.body, registerOTPBodySchema);
	await validateSchema(req.query, registerOTPQuerySchema);
	next();
};

/**
 * Validates user login request body data.
 *
 * This middleware validates the request body for user login requests against
 * the defined validation schema. It ensures that email and password are provided
 * and meet the specified criteria before proceeding with authentication.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates login body with proper schema checking explaining the complete validation process flow
 */
export const validateLogin = async (req, _res, next) => {
	await validateSchema(req.body, loginBodySchema);
	next();
};

/**
 * Validates OTP verification request body data.
 *
 * This middleware validates the request body for OTP verification requests against
 * the defined validation schema. It ensures that email and OTP code are provided
 * and meet the specified criteria before proceeding with verification.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates OTP verification body with proper schema checking explaining the complete validation process flow
 */
export const validateVerifyOTP = async (req, _res, next) => {
	await validateSchema(req.body, verifyOTPBodySchema);
	next();
};

/**
 * Validates password reset request body data.
 *
 * This middleware validates the request body for password reset requests against
 * the defined validation schema. It ensures that email, new password, and OTP are provided
 * and meet the specified criteria before proceeding with password reset.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates password reset body with proper schema checking explaining the complete validation process flow
 */
export const validateResetPassword = async (req, _res, next) => {
	await validateSchema(req.body, resetPasswordBodySchema);
	next();
};

/**
 * Validates Google OAuth login request body data.
 *
 * This middleware validates the request body for Google OAuth login requests against
 * the defined validation schema. It ensures that access token is provided and meets
 * the specified criteria before proceeding with authentication.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates Google OAuth login body with proper schema checking explaining the complete validation process flow
 */
export const validateGoogleOAuthLogin = async (req, _res, next) => {
	await validateSchema(req.body, googleOAuthBodySchema);
	next();
};

/**
 * Validates query parameters for getting all users.
 *
 * This middleware validates query parameters for user listing requests against
 * the defined validation schema. It ensures that search queries and pagination parameters
 * meet the specified criteria before proceeding with user retrieval.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates query parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetAllUsers = async (req, _res, next) => {
	await validateSchema(req.query, getAllUsersQuerySchema);
	next();
};

/**
 * Validates parameters and body for updating user roles.
 *
 * This middleware validates both parameter and body data for user role update requests against
 * the defined validation schemas. It ensures that user ID is provided in parameters and
 * new role information is provided in the body with proper schema validation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates parameters and body with proper schema checking explaining the complete validation process flow
 */
export const validateUpdateUserRole = async (req, _res, next) => {
	await validateSchema(req.params, updateUserRoleParamsSchema);
	await validateSchema(req.body, updateUserRoleBodySchema);
	next();
};

/**
 * Validates user favorites update request body data.
 *
 * This middleware validates the request body for updating user favorites.
 * It checks that songs exist in the database before allowing updates to favorites.
 * It also ensures that songs are not duplicated in favorites.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates favorites update with proper schema and database validation explaining the complete validation process flow
 */
export const validateUpdateFavorites = async (req, _res, next) => {
	await validateSchema(req.body, updateFavoritesBodySchema);

	const { addSongs, favorites } = req.body;

	if (favorites) {
		const songsInDb = await SongModel.find({ _id: { $in: favorites } });
		if (songsInDb.length !== favorites.length)
			throw new ClientFaultError("One or more songs don't exist.");
		return next();
	}
	if (addSongs && addSongs.length > 0) {
		addSongs.forEach((song) => {
			if (req.user.favorites.includes(song))
				throw new ClientFaultError(
					`Song with song number ${song} is already in your favorites.`
				);
		});
		const songsInDb = await SongModel.find({ _id: { $in: addSongs } });
		if (songsInDb.length !== addSongs.length)
			throw new ClientFaultError("One or more songs don't exist.");
	}
	next();
};

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
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateRegisterUser = async (req, _res, next) => {
	await validateSchema(req.body, registerUserBodySchema);
	next();
};

/**
 * Validates OTP registration request body and query parameters.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateRegisterOTP = async (req, _res, next) => {
	await validateSchema(req.body, registerOTPBodySchema);
	await validateSchema(req.query, registerOTPQuerySchema);
	next();
};

/**
 * Validates user login request body data.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateLogin = async (req, _res, next) => {
	await validateSchema(req.body, loginBodySchema);
	next();
};

/**
 * Validates OTP verification request body data.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateVerifyOTP = async (req, _res, next) => {
	await validateSchema(req.body, verifyOTPBodySchema);
	next();
};

/**
 * Validates password reset request body data.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateResetPassword = async (req, _res, next) => {
	await validateSchema(req.body, resetPasswordBodySchema);
	next();
};

/**
 * Validates Google OAuth login request body data.
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateGoogleOAuthLogin = async (req, _res, next) => {
	await validateSchema(req.body, googleOAuthBodySchema);
	next();
};

export const validateGetAllUsers = async (req, _res, next) => {
	await validateSchema(req.query, getAllUsersQuerySchema);
	next();
};

export const validateUpdateUserRole = async (req, _res, next) => {
	await validateSchema(req.params, updateUserRoleParamsSchema);
	await validateSchema(req.body, updateUserRoleBodySchema);
	next();
};

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

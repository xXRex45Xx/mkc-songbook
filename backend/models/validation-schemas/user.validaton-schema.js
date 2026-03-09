/**
 * User validation schemas module.
 * Defines Joi validation schemas for user-related operations.
 * @module validation-schemas/user
 */

import Joi from "joi";

/**
 * Schema for validating user registration request body.
 *
 * This schema defines the structure for user registration data including email, name,
 * password, and OTP code. It includes validation rules to ensure proper data format
 * and security requirements.
 *
 * @typedef {Object} RegisterUserBody
 * @property {string} email - Valid email address (required) with explanation of email format validation
 * @property {string} name - User's name (required, 3-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} password - Password (required, 8-100 characters) with description of security requirements and complexity guidelines
 * @property {number} otp - 6-digit verification code (required) with explanation of OTP generation and validation process
 */
export const registerUserBodySchema = Joi.object({
	email: Joi.string()
		.regex(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		)
		.email()
		.required(),
	name: Joi.string().min(3).max(100).required(),
	password: Joi.string().min(8).max(100).required(),
	otp: Joi.number()
		.integer()
		.positive()
		.min(100000)
		.max(999999)
		.required()
		.messages({
			"number.min": "The validation code must be a 6 digit number.",
			"number.max": "The validation code must be a 6 digit number.",
		}),
}).required();

/**
 * Schema for validating OTP request body.
 *
 * This schema defines the structure for OTP requests including email address. It includes
 * validation rules to ensure proper email format.
 *
 * @typedef {Object} RegisterOTPBody
 * @property {string} email - Valid email address (required) with explanation of email format validation
 */
export const registerOTPBodySchema = Joi.object({
	email: Joi.string()
		.regex(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		)
		.email()
		.required(),
}).required();

/**
 * Schema for validating OTP request query parameters.
 *
 * This schema defines the structure for OTP request query parameters including forgotPassword flag.
 *
 * @typedef {Object} RegisterOTPQuery
 * @property {boolean} [forgotPassword] - Whether this is a password reset request (optional) with explanation of when to use this option
 */
export const registerOTPQuerySchema = Joi.object({
	forgotPassword: Joi.boolean().optional(),
}).required();

/**
 * Schema for validating login request body.
 *
 * This schema defines the structure for user login data including email and password. It includes
 * validation rules to ensure proper format and security requirements.
 *
 * @typedef {Object} LoginBody
 * @property {string} email - Valid email address (required) with explanation of email format validation
 * @property {string} password - Password (required, 8-100 characters) with description of security requirements and complexity guidelines
 */
export const loginBodySchema = Joi.object({
	email: Joi.string()
		.regex(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		)
		.email()
		.required(),
	password: Joi.string().min(8).max(100).required(),
}).required();

/**
 * Schema for validating OTP verification request body.
 *
 * This schema defines the structure for OTP verification data including email and OTP code.
 * It includes validation rules to ensure proper format and verification process.
 *
 * @typedef {Object} VerifyOTPBody
 * @property {string} email - Valid email address (required) with explanation of email format validation
 * @property {number} otp - 6-digit verification code (required) with explanation of OTP generation and validation process
 */
export const verifyOTPBodySchema = Joi.object({
	email: Joi.string()
		.regex(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		)
		.email()
		.required(),
	otp: Joi.number()
		.integer()
		.positive()
		.min(100000)
		.max(999999)
		.required()
		.messages({
			"number.min": "The verification code must be a 6 digit number.",
			"number.max": "The verification code must be a 6 digit number.",
		}),
}).required();

/**
 * Schema for validating password reset request body.
 *
 * This schema defines the structure for password reset data including email, new password,
 * and OTP code. It includes validation rules to ensure proper format and security requirements.
 *
 * @typedef {Object} ResetPasswordBody
 * @property {string} email - Valid email address (required) with explanation of email format validation
 * @property {string} password - New password (required, 8-100 characters) with description of security requirements and complexity guidelines
 * @property {number} otp - 6-digit verification code (required) with explanation of OTP generation and validation process
 */
export const resetPasswordBodySchema = Joi.object({
	email: Joi.string()
		.regex(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		)
		.email()
		.required(),
	password: Joi.string().min(8).max(100).required(),
	otp: Joi.number()
		.integer()
		.positive()
		.min(100000)
		.max(999999)
		.required()
		.messages({
			"number.min": "The verification code must be a 6 digit number.",
			"number.max": "The verification code must be a 6 digit number",
		}),
}).required();

/**
 * Schema for validating Google OAuth login request body.
 *
 * This schema defines the structure for Google OAuth login data including access token.
 * It includes validation rules to ensure proper format and authentication flow.
 *
 * @typedef {Object} GoogleOAuthBody
 * @property {string} accessToken - Google OAuth access token (required) with explanation of OAuth process
 */
export const googleOAuthBodySchema = Joi.object({
	accessToken: Joi.string().min(1).required(),
}).required();

/**
 * Schema for validating user search query parameters.
 *
 * This schema defines the structure for user search parameters including query string,
 * page number, and search type. It supports flexible search capabilities for users.
 *
 * @typedef {Object} GetAllUsersQuery
 * @property {string} [q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {('all'|'name'|'email')} [type] - Search type (optional) with description of available search modes and their behavior
 * @note If 'q' is present, 'type' must also be present
 */
export const getAllUsersQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	page: Joi.number().integer().min(1).optional(),
	type: Joi.string().allow("all", "name", "email").only().optional(),
})
	.and("q", "type")
	.required();

/**
 * Schema for validating update user role parameters.
 *
 * This schema defines the structure for user role update parameters including ID.
 *
 * @typedef {Object} UpdateUserRoleParams
 * @property {string} id - User ID (required) with explanation of generation method and validation rules
 */
export const updateUserRoleParamsSchema = Joi.object({
	id: Joi.string().required(),
}).required();

/**
 * Schema for validating update user role body.
 *
 * This schema defines the structure for user role update data including role.
 *
 * @typedef {Object} UpdateUserRoleBody
 * @property {string} role - User role (required) with explanation of available roles and privilege levels
 */
export const updateUserRoleBodySchema = Joi.object({
	role: Joi.string().allow("admin", "member", "public").required(),
}).required();

/**
 * Schema for validating update favorites body.
 *
 * This schema defines the structure for user favorites update data including arrays of song IDs.
 *
 * @typedef {Object} UpdateFavoritesBody
 * @property {string[]} [favorites] - Array of favorite song IDs (optional) with explanation of how it's used for user preferences
 * @property {string[]} [addSongs] - Array of songs to add to favorites (optional) with explanation of how it's used for user preferences
 * @property {string[]} [removeSongs] - Array of songs to remove from favorites (optional) with explanation of how it's used for user preferences
 */
export const updateFavoritesBodySchema = Joi.object({
	favorites: Joi.array().items(Joi.string().min(1)).optional(),
	addSongs: Joi.array().items(Joi.string().min(1)).optional(),
	removeSongs: Joi.array().items(Joi.string().min(1)).optional(),
})
	.or("addSongs", "removeSongs", "favorites")
	.required();
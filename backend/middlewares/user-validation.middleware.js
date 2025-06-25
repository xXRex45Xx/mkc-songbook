/**
 * User validation middleware module.
 * Provides middleware functions for validating user-related request data using validation schemas.
 */

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
} from "../models/validation-schemas/user.validaton-schema.js";
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

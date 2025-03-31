/**
 * User validation schemas module.
 * Defines Joi validation schemas for user-related operations.
 * @module validation-schemas/user
 */

import Joi from "joi";

/**
 * Schema for validating user registration request body.
 * @constant {Joi.ObjectSchema}
 * @property {string} email - Valid email address
 * @property {string} name - User's name (3-100 characters)
 * @property {string} password - Password (8-100 characters)
 * @property {number} otp - 6-digit verification code
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
 * @constant {Joi.ObjectSchema}
 * @property {string} email - Valid email address
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
 * @constant {Joi.ObjectSchema}
 * @property {boolean} [forgotPassword] - Whether this is a password reset request
 */
export const registerOTPQuerySchema = Joi.object({
    forgotPassword: Joi.boolean().optional(),
}).required();

/**
 * Schema for validating login request body.
 * @constant {Joi.ObjectSchema}
 * @property {string} email - Valid email address
 * @property {string} password - Password (8-100 characters)
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
 * @constant {Joi.ObjectSchema}
 * @property {string} email - Valid email address
 * @property {number} otp - 6-digit verification code
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
 * @constant {Joi.ObjectSchema}
 * @property {string} email - Valid email address
 * @property {string} password - New password (8-100 characters)
 * @property {number} otp - 6-digit verification code
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
 * @constant {Joi.ObjectSchema}
 * @property {string} accessToken - Google OAuth access token
 */
export const googleOAuthBodySchema = Joi.object({
    accessToken: Joi.string().min(1).required(),
}).required();

export const getAllUsersQuerySchema = Joi.object({
    q: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).optional(),
    type: Joi.string().allow("all", "name", "email").only().optional(),
})
    .and("q", "type")
    .required();

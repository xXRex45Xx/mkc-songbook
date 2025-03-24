/**
 * User Routes Module.
 * Handles all user-related routes including authentication, registration, and profile management.
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
} from "../controllers/userController.js";
import localAuth from "../middlewares/local-auth.middleware.js";
import {
    validateLogin,
    validateRegisterOTP,
    validateRegisterUser,
    validateResetPassword,
    validateVerifyOTP,
} from "../middlewares/user-validation.middleware.js";
import checkUserExists from "../middlewares/check-user-exists.middleware.js";
import passport from "passport";

/**
 * Express router instance for user routes.
 * All routes are prefixed with '/api/user'
 * @type {Router}
 */
const userRouter = Router();

/**
 * POST /api/user
 * Register a new user with email verification.
 * @route POST /api/user
 * @middleware validateRegisterUser - Validates registration data
 * @middleware validateOtp - Validates OTP code
 * @body {Object} body - Registration data
 * @body {string} body.email - User's email
 * @body {string} body.name - User's name
 * @body {string} body.password - User's password
 * @body {number} body.otp - Verification code
 */
userRouter.post(
    "/",
    wrapAsync(validateRegisterUser),
    wrapAsync(validateOtp),
    wrapAsync(registerUser)
);

/**
 * POST /api/user/otp
 * Request OTP for registration or password reset.
 * @route POST /api/user/otp
 * @middleware validateRegisterOTP - Validates email format
 * @middleware checkUserExists - Checks if user exists based on context
 * @body {Object} body - OTP request data
 * @body {string} body.email - User's email
 * @query {boolean} [forgotPassword] - Whether this is a password reset request
 */
userRouter.post(
    "/otp",
    wrapAsync(validateRegisterOTP),
    wrapAsync(checkUserExists),
    wrapAsync(registerOTP)
);

/**
 * POST /api/user/verify-otp
 * Verify OTP code.
 * @route POST /api/user/verify-otp
 * @middleware validateVerifyOTP - Validates verification data
 * @body {Object} body - Verification data
 * @body {string} body.email - User's email
 * @body {number} body.otp - OTP code to verify
 */
userRouter.post(
    "/verify-otp",
    wrapAsync(validateVerifyOTP),
    wrapAsync(verifyOTP)
);

/**
 * POST /api/user/login
 * Authenticate user with email and password.
 * @route POST /api/user/login
 * @middleware validateLogin - Validates login credentials
 * @body {Object} body - Login credentials
 * @body {string} body.email - User's email
 * @body {string} body.password - User's password
 */
userRouter.post("/login", wrapAsync(validateLogin), wrapAsync(localAuth));

/**
 * GET /api/user/current-user
 * Get currently authenticated user's profile.
 * @route GET /api/user/current-user
 * @middleware passport.authenticate - Validates JWT token
 * @security JWT
 */
userRouter.get(
    "/current-user",
    passport.authenticate("jwt", { session: false }),
    wrapAsync(getCurrentUser)
);

/**
 * POST /api/user/google/callback
 * Handle Google OAuth authentication callback.
 * @route POST /api/user/google/callback
 * @body {Object} body - Google OAuth data
 * @body {string} body.accessToken - Google OAuth access token
 */
userRouter.post("/google/callback", wrapAsync(googleOAuthLogin));

/**
 * PUT /api/user/reset-password
 * Reset user's password with OTP verification.
 * @route PUT /api/user/reset-password
 * @middleware validateResetPassword - Validates password reset data
 * @middleware validateOtp - Validates OTP code
 * @body {Object} body - Password reset data
 * @body {string} body.email - User's email
 * @body {string} body.password - New password
 * @body {number} body.otp - Verification code
 */
userRouter.put(
    "/reset-password",
    wrapAsync(validateResetPassword),
    wrapAsync(validateOtp),
    wrapAsync(resetPassword)
);

export default userRouter;

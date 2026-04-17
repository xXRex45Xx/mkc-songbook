/**
 * Authorization middleware module for role-based access control.
 * This module provides middleware for restricting access to routes based on user roles.
 */

import { ForbiddenError, UnauthorizedError } from "../utils/error.util.js";
import passport from "passport";

/**
 * Creates a middleware function that checks if the authenticated user has one of the required roles.
 *
 * This function implements role-based authorization by:
 * 1. Verifying that a user is authenticated through JWT
 * 2. Checking if the authenticated user's role is in the allowed roles list
 * 3. Throwing appropriate errors if authorization fails
 *
 * @param {string[]} roles - Array of role names that are allowed to access the route with explanation of valid role values
 * @returns {Function} Express middleware function for role-based authorization explaining the complete process flow and validation logic
 * @throws {UnauthorizedError} If user is not authenticated with clear explanation of authentication requirements
 * @throws {ForbiddenError} If user's role is not in the allowed roles list with specific context about role restrictions
 */
const roleBasedAuthorization = (roles) => {
	return async (req, _res, next) => {
		if (!req.user)
			throw new UnauthorizedError(
				"You must be logged in to access this resource."
			);
		if (!roles.includes(req.user.role)) {
			throw new ForbiddenError(
				"You are not authorized to access this resource."
			);
		}
		next();
	};
};

/**
 * Optional authentication middleware for handling cases where authentication is not required.
 *
 * This function authenticates users through JWT but does not fail if no user is authenticated.
 * It sets the req.user property if authentication succeeds, allowing other middleware to access user data.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Sets req.user if authentication succeeds or continues without user context explaining the complete authentication process flow
 */
export const optionalAuth = async (req, _res, next) => {
	passport.authenticate("jwt", { session: false }, (_err, user) => {
		if (user) req.user = user;
		next();
	})(req, _res, next);
};

export default roleBasedAuthorization;

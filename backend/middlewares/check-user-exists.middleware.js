/**
 * User existence validation middleware module.
 * Provides middleware for checking if a user exists based on the context (registration or password reset).
 */

import UserModel from "../models/user.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Checks if a user exists based on the email and request context.
 *
 * This middleware validates whether a user exists in the database based on the request context:
 * - For registration: throws error if user already exists (preventing duplicate registrations)
 * - For password reset: throws error if user doesn't exist (ensuring valid reset requests)
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Request body containing user email with explanation of validation rules and format requirements
 * @param {Object} req.query - Query parameters containing forgotPassword flag with explanation of context usage
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates user existence with proper context-based checks explaining the complete validation process flow
 * @throws {ClientFaultError} If user existence check fails based on context with clear explanation of root cause and error conditions
 */
const checkUserExists = async (req, _res, next) => {
    const { email } = req.body;
    const { forgotPassword } = req.query;
    const user = await UserModel.findOne({ email });
    if (user && !forgotPassword)
        throw new ClientFaultError("User already exists");
    if (!user && forgotPassword)
        throw new ClientFaultError("User doesn't exist");
    next();
};

export default checkUserExists;

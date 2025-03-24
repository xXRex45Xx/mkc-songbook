/**
 * User existence validation middleware module.
 * Provides middleware for checking if a user exists based on the context (registration or password reset).
 */

import UserModel from "../models/user.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Checks if a user exists based on the email and request context.
 * For registration: throws error if user exists
 * For password reset: throws error if user doesn't exist
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user email
 * @param {Object} req.query - Query parameters containing forgotPassword flag
 * @param {Object} _res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} If user existence check fails based on context
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

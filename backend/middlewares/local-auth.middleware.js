/**
 * Local authentication middleware module.
 * Handles user authentication using Passport's local strategy and JWT token generation.
 */

import passport from "passport";
import { ClientFaultError, ServerFaultError } from "../utils/error.util.js";
import jwt from "jsonwebtoken";

/**
 * Authenticates a user using local strategy and generates a JWT token.
 *
 * This middleware authenticates users using Passport's local strategy (email/password).
 * Upon successful authentication, it generates a JWT token containing the user's ID
 * that expires in 30 days. The token is used for subsequent authenticated requests.
 *
 * @param {Object} req - Express request object containing login credentials with explanation of auth flow and token generation process
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Object} Response containing user data and JWT token with explanation of token structure and authentication process
 * @throws {ClientFaultError} If authentication fails due to invalid credentials with clear explanation of authentication failure conditions and error context
 * @throws {ServerFaultError} If there's an internal server error during authentication with clear explanation of server error conditions and error context
 */
const localAuth = async (req, res, next) => {
    passport.authenticate("local", {}, (err, user) => {
        if (err) return next(new ServerFaultError(err));
        if (!user)
            return next(new ClientFaultError("Invalid username or password."));
        req.login(user, { session: false }, (err) => {
            if (err) return next(new ServerFaultError(err));
            const token = jwt.sign(
                {
                    id: user._id,
                },
                process.env.JWT_SECRET,
                { expiresIn: "30 days" }
            );
            return res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        });
    })(req, res, next);
};

export default localAuth;


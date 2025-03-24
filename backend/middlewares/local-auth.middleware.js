/**
 * Local authentication middleware module.
 * Handles user authentication using Passport's local strategy and JWT token generation.
 */

import passport from "passport";
import { ClientFaultError, ServerFaultError } from "../utils/error.util.js";
import jwt from "jsonwebtoken";

/**
 * Authenticates a user using local strategy and generates a JWT token.
 * Uses Passport's local strategy for authentication and creates a JWT token upon successful login.
 * The token contains the user's ID and expires in 30 days.
 * @param {Object} req - Express request object containing login credentials
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response containing user data and JWT token
 * @throws {ClientFaultError} If authentication fails due to invalid credentials
 * @throws {ServerFaultError} If there's an internal server error during authentication
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

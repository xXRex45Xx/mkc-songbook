/**
 * Local authentication middleware module.
 * Handles user authentication using Passport's local strategy and JWT token generation.
 */

import passport from "passport";
import { ClientFaultError, ServerFaultError } from "../utils/error.util.js";
import { issueSession } from "../utils/session.util.js";
import { recordLoginFailure, recordLoginSuccess } from "./login-risk.middleware.js";

/**
 * Authenticates a user using local strategy and starts a cookie session.
 *
 * This middleware authenticates users using Passport's local strategy (email/password).
 * Upon successful authentication, it sets the `mkc_at` access cookie and the `mkc_rt`
 * refresh cookie (see utils/session.util.js). No token is sent in the response body.
 *
 * @param {Object} req - Express request object containing login credentials, covering the
 *   auth flow and session creation process
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Object} Response containing user data, with the session in cookies
 * @throws {ClientFaultError} If authentication fails due to invalid credentials with clear explanation of authentication failure conditions and error context
 * @throws {ServerFaultError} If there's an internal server error during authentication with clear explanation of server error conditions and error context
 */
const localAuth = async (req, res, next) => {
    passport.authenticate("local", {}, async (err, user) => {
        if (err) return next(new ServerFaultError(err));
        if (!user) {
            await recordLoginFailure(req);
            return next(new ClientFaultError("Invalid username or password."));
        }
        req.login(user, { session: false }, async (err) => {
            if (err) return next(new ServerFaultError(err));
            try {
                await recordLoginSuccess(req, res, user);
                await issueSession(res, user);
                return res.status(200).json({
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        favorites: user.favorites,
                    },
                });
            } catch (error) {
                return next(new ServerFaultError(error));
            }
        });
    })(req, res, next);
};

export default localAuth;

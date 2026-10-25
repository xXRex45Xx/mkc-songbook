/**
 * Rate Limit Middleware Module.
 * Throttles sign-in and verification attempts so one-time codes and passwords
 * cannot be guessed by brute force.
 * @module middlewares/rate-limit
 */

import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * Builds a limiter that answers 429 with the API's `{ message }` error shape.
 *
 * @param {number} limit - Maximum requests per window for one key
 * @param {Function} keyGenerator - Maps a request to its rate-limit key
 * @returns {Function} Express middleware
 */
const buildLimiter = (limit, keyGenerator) =>
	rateLimit({
		windowMs: FIFTEEN_MINUTES,
		limit,
		standardHeaders: "draft-8",
		legacyHeaders: false,
		keyGenerator,
		// Only failed guesses should spend the budget.
		skipSuccessfulRequests: true,
		// Route tests log in far more often than any real client; the limiter's own test turns this on.
		skip: () =>
			process.env.NODE_ENV === "test" && process.env.RATE_LIMIT_IN_TEST !== "on",
		handler: (req, res) =>
			res.status(429).json({
				message: "Too many attempts. Please, try again later.",
			}),
	});

/**
 * Key by client address. IPv6 addresses are grouped by subnet.
 *
 * @param {Request} req - Express request object
 * @returns {string} Rate-limit key
 */
const byIp = (req) => ipKeyGenerator(req.ip);

/**
 * Key by target account email, so guesses spread over many IPs still hit one budget.
 *
 * @param {Request} req - Express request object
 * @returns {string} Rate-limit key
 */
const byEmail = (req) => {
	const email = req.body?.email;
	return typeof email === "string" && email
		? `email:${email.trim().toLowerCase()}`
		: byIp(req);
};

/** Per-address cap on every auth route. */
export const authIpLimiter = buildLimiter(30, byIp);

/** Per-email cap on code and password guesses (verify-otp, register, reset, login). */
export const authEmailLimiter = buildLimiter(10, byEmail);

/** Per-email cap on code emails sent (`/otp`), to stop mail flooding. */
export const otpRequestLimiter = buildLimiter(5, byEmail);

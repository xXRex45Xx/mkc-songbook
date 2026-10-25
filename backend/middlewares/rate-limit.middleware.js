/**
 * Rate Limit Middleware Module.
 * A generic per-address limiter for the API and a higher one for audio streaming. Guess limits for one-time
 * codes live in the OTP model and login risk checks in login-risk.middleware.js.
 * @module middlewares/rate-limit
 */

import { rateLimit, ipKeyGenerator } from "express-rate-limit";

/**
 * Tells whether a request streams song audio (`GET /api/song/:id/audio`). Matches
 * on the path under the `/api` mount, where `req.path` is `/song/:id/audio`.
 *
 * @param {Request} req - Express request object
 * @returns {boolean} True for an audio GET or HEAD
 */
export const isAudioRequest = (req) =>
	(req.method === "GET" || req.method === "HEAD") &&
	/^\/song\/[^/]+\/audio$/.test(req.path);

/**
 * Tells whether a request is a password login (`POST /api/user/login`). Matches on the
 * path under the `/api` mount, where `req.path` is `/user/login`.
 *
 * @param {Request} req - Express request object
 * @returns {boolean} True for a login POST
 */
export const isLoginRequest = (req) =>
	req.method === "POST" && req.path === "/user/login";

/**
 * Builds a per-address limiter: `limit` requests per 15 minutes for each client address,
 * IPv6 addresses grouped by subnet. Answers 429 with the API's `{ message }` shape, except
 * for a login, which gets the same 400 answer as a wrong password (and no `Retry-After`) so a
 * throttled attacker cannot tell throttling from a wrong guess.
 *
 * @param {number} limit - Requests allowed per window for one address
 * @param {Function} [appliesTo] - Receives the request; requests it rejects are not counted
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (limit, appliesTo = () => true) =>
	rateLimit({
		windowMs: 15 * 60 * 1000,
		limit,
		standardHeaders: "draft-8",
		legacyHeaders: false,
		keyGenerator: (req) => ipKeyGenerator(req.ip),
		// Route tests make far more requests than any real client; the limiter's own test turns this on.
		skip: (req) =>
			(process.env.NODE_ENV === "test" && process.env.RATE_LIMIT_IN_TEST !== "on") ||
			!appliesTo(req),
		handler: (req, res) => {
			if (isLoginRequest(req)) {
				res.removeHeader("Retry-After");
				return res
					.status(400)
					.json({ message: "Invalid username or password." });
			}
			return res.status(429).json({
				message: "Too many requests. Please, try again later.",
			});
		},
	});

/** Generic limiter mounted on `/api` in index.js: `RATE_LIMIT_MAX` requests per 15 minutes (default 600). Audio is counted by `audioRateLimiter` instead. */
export const apiRateLimiter = createRateLimiter(
	Number(process.env.RATE_LIMIT_MAX) || 600,
	(req) => !isAudioRequest(req)
);

/**
 * Audio streaming limiter, mounted after `apiRateLimiter`: `AUDIO_RATE_LIMIT_MAX` requests
 * per 15 minutes (default 6000). The player fetches a song in 500 KB range requests, so
 * many listeners behind one address need far more than the generic budget.
 */
export const audioRateLimiter = createRateLimiter(
	Number(process.env.AUDIO_RATE_LIMIT_MAX) || 6000,
	isAudioRequest
);

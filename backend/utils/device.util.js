/**
 * Device cookie utilities.
 * A device is a browser that signed in before. It carries a random token in an
 * HttpOnly cookie; only the token's hash is stored.
 * @module utils/device
 */
import { createHash, randomBytes } from "crypto";

export const DEVICE_COOKIE = "mkc_did";

const DEVICE_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 180;
/** Shape of the random tokens kept in HttpOnly cookies: 256 bits, base64url. */
export const OPAQUE_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * Hashes a string with SHA-256.
 *
 * @param {string} value - Text to hash
 * @returns {string} Hex digest
 */
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/**
 * Reads the device token from the request cookies.
 *
 * @param {Request} req - Express request object (cookies parsed by cookie-parser)
 * @returns {string|null} The token, or null when absent or malformed
 */
export const readDeviceToken = (req) => {
	const token = req.cookies?.[DEVICE_COOKIE];
	return typeof token === "string" && OPAQUE_TOKEN.test(token) ? token : null;
};

/**
 * Creates a new random token for an HttpOnly cookie.
 *
 * @returns {string} 43-character base64url token (256 bits)
 */
export const createOpaqueToken = () => randomBytes(32).toString("base64url");

/**
 * Creates a new random device token.
 *
 * @returns {string} 43-character base64url token (256 bits)
 */
export const createDeviceToken = createOpaqueToken;

/**
 * Sets the device cookie. The frontend and API are on different origins in
 * production, so the cookie there is `SameSite=None; Secure`.
 *
 * @param {Response} res - Express response object
 * @param {string} token - Device token to store
 */
export const setDeviceCookie = (res, token) => {
	const production = process.env.NODE_ENV === "production";
	res.cookie(DEVICE_COOKIE, token, {
		httpOnly: true,
		secure: production,
		sameSite: production ? "none" : "lax",
		path: "/api/user",
		maxAge: DEVICE_COOKIE_MAX_AGE,
	});
};

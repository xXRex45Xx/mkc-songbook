/**
 * Session utilities.
 * A session is two HttpOnly cookies: `mkc_at`, a short-lived access JWT, and `mkc_rt`, an
 * opaque refresh token that is exchanged for a new pair on every refresh. Refresh tokens are
 * stored hashed (see models/refresh-token.model.js). The cookie flags live only here.
 * @module utils/session
 */
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import RefreshTokenModel from "../models/refresh-token.model.js";
import UserModel from "../models/user.model.js";
import { UnauthorizedError } from "./error.util.js";
import { OPAQUE_TOKEN, createOpaqueToken, sha256 } from "./device.util.js";

export const ACCESS_COOKIE = "mkc_at";
export const REFRESH_COOKIE = "mkc_rt";

const REFRESH_COOKIE_PATH = "/api/user/session";
const DAY_MS = 1000 * 60 * 60 * 24;

/** A refresh token used again within this window is a second tab's race, not theft. */
export const REFRESH_GRACE_MS = 10 * 1000;

/**
 * A used refresh token presented again within this window is a lost response, not theft, as
 * long as the token issued in exchange was never used. Used rows older than this are deleted.
 */
export const REFRESH_RETRY_MS = 60 * 60 * 1000;

/**
 * Reads a positive number from the environment.
 *
 * @param {string} name - Environment variable name
 * @param {number} fallback - Value used when the variable is unset or not a positive number
 * @returns {number} The configured or default value
 */
const readPositiveNumber = (name, fallback) => {
	const value = Number(process.env[name]);
	return Number.isFinite(value) && value > 0 ? value : fallback;
};

/** @returns {number} Access token lifetime in ms (`ACCESS_TOKEN_TTL_MINUTES`, default 15) */
const accessTtlMs = () => readPositiveNumber("ACCESS_TOKEN_TTL_MINUTES", 15) * 60 * 1000;

/** @returns {number} Refresh token lifetime in ms (`REFRESH_TOKEN_TTL_DAYS`, default 30) */
const refreshTtlMs = () => readPositiveNumber("REFRESH_TOKEN_TTL_DAYS", 30) * DAY_MS;

/** @returns {number} Longest a sign-in can last in ms (`REFRESH_MAX_AGE_DAYS`, default 90) */
const sessionMaxAgeMs = () => readPositiveNumber("REFRESH_MAX_AGE_DAYS", 90) * DAY_MS;

/**
 * Builds the flags shared by both session cookies. The frontend and API are on the same
 * site (sibling subdomains), so `SameSite=Lax` is enough.
 *
 * @param {string} path - Cookie path
 * @param {number} [maxAge] - Lifetime in milliseconds; omit when clearing
 * @returns {Object} Options for `res.cookie` / `res.clearCookie`
 */
const cookieOptions = (path, maxAge) => {
	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path,
	};
	if (maxAge) options.maxAge = maxAge;
	return options;
};

/**
 * Signs an access token.
 *
 * @param {Types.ObjectId|string} userId - Account id
 * @param {string} family - Refresh-token family this access token belongs to
 * @returns {string} Signed JWT
 */
const signAccessToken = (userId, family) =>
	jwt.sign({ id: userId, sid: family }, process.env.JWT_SECRET, {
		algorithm: "HS256",
		expiresIn: Math.floor(accessTtlMs() / 1000),
	});

/**
 * Sets the access cookie.
 *
 * @param {Response} res - Express response object
 * @param {Types.ObjectId|string} userId - Account id
 * @param {string} family - Refresh-token family
 */
const setAccessCookie = (res, userId, family) => {
	res.cookie(
		ACCESS_COOKIE,
		signAccessToken(userId, family),
		cookieOptions("/api", accessTtlMs())
	);
};

/**
 * Stores a new refresh token. It expires `REFRESH_TOKEN_TTL_DAYS` from now, but never later
 * than `REFRESH_MAX_AGE_DAYS` after the sign-in that started the family.
 *
 * @param {Types.ObjectId|string} userId - Account id
 * @param {string} family - Refresh-token family
 * @param {Date} familyStartedAt - When the family's first token was issued
 * @returns {Promise<string>} The token, to be set in the cookie
 */
const createRefreshToken = async (userId, family, familyStartedAt) => {
	const token = createOpaqueToken();
	await RefreshTokenModel.create({
		user: userId,
		family,
		familyStartedAt,
		tokenHash: sha256(token),
		expiresAt: new Date(
			Math.min(Date.now() + refreshTtlMs(), familyStartedAt.getTime() + sessionMaxAgeMs())
		),
	});
	return token;
};

/**
 * Sets the refresh cookie.
 *
 * @param {Response} res - Express response object
 * @param {string} token - Refresh token
 */
const setRefreshCookie = (res, token) => {
	res.cookie(REFRESH_COOKIE, token, cookieOptions(REFRESH_COOKIE_PATH, refreshTtlMs()));
};

/**
 * Removes both session cookies from the browser.
 *
 * @param {Response} res - Express response object
 */
export const clearSessionCookies = (res) => {
	res.clearCookie(ACCESS_COOKIE, cookieOptions("/api"));
	res.clearCookie(REFRESH_COOKIE, cookieOptions(REFRESH_COOKIE_PATH));
};

/**
 * Starts a session for a user: new refresh-token family, both cookies set.
 *
 * @param {Response} res - Express response object
 * @param {Object} user - Mongoose user document (only `_id` is read)
 * @returns {Promise<void>}
 */
export const issueSession = async (res, user) => {
	const family = randomUUID();
	setRefreshCookie(res, await createRefreshToken(user._id, family, new Date()));
	setAccessCookie(res, user._id, family);
};

/**
 * Deletes every refresh token in one family (one browser's sign-in).
 *
 * @param {string} family - Family id
 * @returns {Promise<void>}
 */
export const revokeFamily = async (family) => {
	await RefreshTokenModel.deleteMany({ family });
};

/**
 * Deletes every refresh token of a user, signing them out everywhere.
 *
 * @param {Types.ObjectId|string} userId - Account id
 * @returns {Promise<void>}
 */
export const revokeAllSessions = async (userId) => {
	await RefreshTokenModel.deleteMany({ user: userId });
};

/**
 * Reads the refresh token from the request cookies.
 *
 * @param {Request} req - Express request object (cookies parsed by cookie-parser)
 * @returns {string|null} The token, or null when absent or malformed
 */
const readRefreshToken = (req) => {
	const token = req.cookies?.[REFRESH_COOKIE];
	return typeof token === "string" && OPAQUE_TOKEN.test(token) ? token : null;
};

/**
 * Revokes the session named by the request's refresh cookie, if there is one.
 *
 * @param {Request} req - Express request object
 * @returns {Promise<void>}
 */
export const revokeRequestSession = async (req) => {
	const token = readRefreshToken(req);
	if (!token) return;
	const row = await RefreshTokenModel.findOne({ tokenHash: sha256(token) });
	if (row) await revokeFamily(row.family);
};

/**
 * Tells whether a used refresh token presented again is benign. Within `REFRESH_GRACE_MS` it is
 * a second tab racing the first. Within `REFRESH_RETRY_MS` it is a response that never arrived,
 * as long as none of the tokens issued after it has been used yet.
 *
 * @param {Object} row - The refresh token row that was presented
 * @returns {Promise<"race"|"retry"|null>} Kind of benign replay, or null when it is not one
 */
const isBenignReplay = async (row) => {
	const usedAt = (await RefreshTokenModel.findById(row._id))?.usedAt;
	if (!usedAt) return null;

	const age = Date.now() - usedAt.getTime();
	if (age <= REFRESH_GRACE_MS) return "race";

	if (age > REFRESH_RETRY_MS) return null;

	const later = await RefreshTokenModel.find(
		{ family: row.family, createdAt: { $gt: row.createdAt } },
		{ usedAt: true }
	);
	return later.length > 0 && later.every((successor) => !successor.usedAt) ? "retry" : null;
};

/**
 * Exchanges the request's refresh token for a new access cookie and a new refresh cookie.
 *
 * A token that was already exchanged is a replay: benign ones (see `isBenignReplay`) are served
 * like a normal refresh, any other one deletes the whole family. Used rows older than
 * `REFRESH_RETRY_MS` are removed on the way. On any failure both cookies are cleared.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @throws {UnauthorizedError} If the token is missing, unknown, expired, replayed, or its
 *   user is gone
 * @throws {ServerFaultError} If a database operation fails unexpectedly
 * @example
 * // Example usage:
 * POST /api/user/session/refresh
 * Cookie: mkc_rt=<refresh token>
 * This example swaps the refresh token for a new access and refresh cookie.
 */
export const rotateSession = async (req, res) => {
	const fail = () => {
		clearSessionCookies(res);
		return new UnauthorizedError("Your session has expired. Please, sign in again.");
	};

	const token = readRefreshToken(req);
	if (!token) throw fail();

	const row = await RefreshTokenModel.findOne({ tokenHash: sha256(token) });
	if (!row || row.expiresAt <= new Date()) throw fail();

	if (!(await UserModel.exists({ _id: row.user }))) {
		await revokeFamily(row.family);
		throw fail();
	}

	const claimed = await RefreshTokenModel.findOneAndUpdate(
		{ _id: row._id, usedAt: null },
		{ usedAt: new Date() }
	);

	const replay = claimed ? null : await isBenignReplay(row);
	if (!claimed && !replay) {
		console.warn(`Refresh token reuse detected; revoking session family ${row.family}`);
		await revokeFamily(row.family);
		throw fail();
	}

	// A retry after a lost response replaces the token the client never received.
	if (replay === "retry")
		await RefreshTokenModel.deleteMany({
			family: row.family,
			createdAt: { $gt: row.createdAt },
			usedAt: null,
		});

	const next = await createRefreshToken(
		row.user,
		row.family,
		row.familyStartedAt ?? row.createdAt
	);

	// A logout or password reset that ran since the claim deleted the row: undo the new token.
	if (!(await RefreshTokenModel.exists({ _id: row._id }))) {
		await revokeFamily(row.family);
		throw fail();
	}

	await RefreshTokenModel.deleteMany({
		family: row.family,
		usedAt: { $lt: new Date(Date.now() - REFRESH_RETRY_MS) },
	});

	setRefreshCookie(res, next);
	setAccessCookie(res, row.user, row.family);
};

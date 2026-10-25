/**
 * Login risk middleware module.
 * Decides whether a password login must solve a captcha, and records the outcome.
 *
 * - A browser that signed in to the account before (device cookie) skips every check
 *   here and is limited only by the generic IP rate limit.
 * - A script-like request needs a captcha.
 * - A client with five failed attempts in 15 minutes needs a captcha. A client is its
 *   device cookie if it has one, and always its address plus User-Agent, so clearing
 *   the cookie does not reset the count.
 * - An account with five failed attempts in 15 minutes, from any clients, needs a captcha
 *   from every client that is not a known device. A captcha never locks anyone out.
 * @module middlewares/login-risk
 */

import DeviceModel from "../models/device.model.js";
import LoginAttemptModel from "../models/login-attempt.model.js";
import UserModel from "../models/user.model.js";
import { isScriptLike } from "../utils/bot-signal.util.js";
import { isCaptchaEnabled, verifyCaptcha } from "../utils/captcha.util.js";
import {
	createDeviceToken,
	readDeviceToken,
	setDeviceCookie,
	sha256,
} from "../utils/device.util.js";
import { ForbiddenError } from "../utils/error.util.js";

/** Failed attempts from one client before a captcha is required. */
export const CAPTCHA_AFTER_FAILURES = 5;

/** Known devices kept per account; the least recently used is dropped past this. */
export const MAX_DEVICES_PER_USER = 20;

const DAY = 1000 * 60 * 60 * 24;

/**
 * Builds the failure-counter keys for a request: one for the account being tried,
 * one for the client's address and User-Agent, and one for its device cookie if any.
 *
 * @param {Request} req - Express request object
 * @param {string} email - Email the login names
 * @param {string|null} deviceToken - Device token from the cookie, if any
 * @returns {string[]} Counter keys
 */
const clientKeys = (req, email, deviceToken) => {
	const keys = [
		`account:${email.trim().toLowerCase()}`,
		`anon:${req.ip}:${sha256(req.headers["user-agent"] ?? "")}`,
	];
	if (deviceToken) keys.push(`device:${sha256(deviceToken)}`);
	return keys;
};

/**
 * Builds the error that tells the frontend to show the captcha.
 *
 * @param {string} message - Text shown to the user
 * @returns {ForbiddenError} Error whose `errorCode` is `CAPTCHA_REQUIRED`, sent to the client as `code`
 */
const captchaRequired = (message) => {
	const error = new ForbiddenError(message);
	error.errorCode = "CAPTCHA_REQUIRED";
	return error;
};

/**
 * Checks the risk of a login request before the password is tried.
 * Sets `req.loginRisk = { keys }`; `keys` is empty for a known device.
 *
 * @param {Object} req - Express request object with a validated login body
 * @param {Object} _res - Express response object (unused)
 * @param {Function} next - Express next middleware function
 * @throws {ForbiddenError} With `errorCode` `CAPTCHA_REQUIRED` when a captcha is needed and missing or wrong
 */
export const assessLoginRisk = async (req, _res, next) => {
	const { email, captchaToken } = req.body;
	const deviceToken = readDeviceToken(req);

	if (deviceToken) {
		const user = await UserModel.findOne(
			{ email: email.trim().toLowerCase() },
			{ _id: true }
		);
		const known =
			user &&
			(await DeviceModel.exists({
				user: user._id,
				tokenHash: sha256(deviceToken),
			}));
		if (known) {
			req.loginRisk = { keys: [] };
			return next();
		}
	}

	const keys = clientKeys(req, email, deviceToken);
	req.loginRisk = { keys };

	const counters = await LoginAttemptModel.find({ key: { $in: keys } });
	const failures = Math.max(0, ...counters.map((counter) => counter.count));

	if (
		isCaptchaEnabled() &&
		(isScriptLike(req) || failures >= CAPTCHA_AFTER_FAILURES)
	) {
		if (!captchaToken)
			throw captchaRequired("Please complete the captcha to continue.");
		if (!(await verifyCaptcha(captchaToken, req.ip)))
			throw captchaRequired(
				"Captcha verification failed. Please try again."
			);
	}
	next();
};

/**
 * Counts a failed password attempt against the client's keys.
 * A database error is logged and ignored so a failure never becomes a server error.
 *
 * @param {Request} req - Express request object after `assessLoginRisk`
 * @returns {Promise<void>}
 */
export const recordLoginFailure = async (req) => {
	try {
		await Promise.all(
			(req.loginRisk?.keys ?? []).map((key) =>
				LoginAttemptModel.findOneAndUpdate(
					{ key },
					{ $inc: { count: 1 }, $setOnInsert: { createdAt: new Date() } },
					{ upsert: true }
				)
			)
		);
	} catch (error) {
		console.error("Failed to record login failure", error);
	}
};

/**
 * Clears the client's failure counters and remembers the device.
 * A known device gets its last-used time refreshed; any other browser gets a new
 * device token in an HttpOnly cookie. A database error is logged and ignored.
 *
 * @param {Request} req - Express request object after `assessLoginRisk`
 * @param {Response} res - Express response object, used to set the device cookie
 * @param {Object} user - The user who just signed in
 * @returns {Promise<void>}
 */
export const recordLoginSuccess = async (req, res, user) => {
	try {
		const keys = req.loginRisk?.keys ?? [];
		if (keys.length) await LoginAttemptModel.deleteMany({ key: { $in: keys } });

		const deviceToken = readDeviceToken(req);
		if (deviceToken) {
			const touched = await DeviceModel.findOneAndUpdate(
				{
					user: user._id,
					tokenHash: sha256(deviceToken),
					lastUsedAt: { $lt: new Date(Date.now() - DAY) },
				},
				{ lastUsedAt: new Date() }
			);
			const known =
				touched ||
				(await DeviceModel.exists({
					user: user._id,
					tokenHash: sha256(deviceToken),
				}));
			if (known) return;
		}

		const devices = await DeviceModel.find({ user: user._id }, { _id: true })
			.sort({ lastUsedAt: 1 })
			.lean();
		const surplus = devices.length - (MAX_DEVICES_PER_USER - 1);
		if (surplus > 0)
			await DeviceModel.deleteMany({
				_id: { $in: devices.slice(0, surplus).map((device) => device._id) },
			});

		const newToken = createDeviceToken();
		await DeviceModel.create({ user: user._id, tokenHash: sha256(newToken) });
		setDeviceCookie(res, newToken);
	} catch (error) {
		console.error("Failed to record login success", error);
	}
};

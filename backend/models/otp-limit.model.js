/**
 * OTP Limit Model - Code requests and wrong guesses per email.
 *
 * One counter per email, created by the first code request of a window and deleted by Mongo
 * one hour later. It outlives every single code, so asking for a new code never gives a
 * fresh set of guesses. Used by `registerOTP` and `OTPModel.verifyCode`.
 * @module models/otp-limit
 *
 * @property {string} email - Email the codes are sent to (lowercase)
 * @property {number} requests - Codes requested in the window
 * @property {number} failures - Wrong guesses over every code of the window
 * @property {Date} createdAt - First request of the window (TTL 1 hour)
 */
import { Schema, model } from "mongoose";

/** Codes one email may request per window; the next request is refused. */
export const MAX_OTP_REQUESTS = 5;

/** Wrong guesses one email may collect per window, over all its codes, before it is locked. */
export const MAX_OTP_FAILURES = 10;

/** Length of the window, in seconds. */
export const OTP_WINDOW_SECONDS = 60 * 60;

const otpLimitSchema = new Schema({
	email: { type: String, required: true, unique: true, trim: true, lowercase: true },
	requests: { type: Number, default: 0 },
	failures: { type: Number, default: 0 },
	createdAt: { type: Date, expires: OTP_WINDOW_SECONDS },
});

/**
 * Counts a code request against the email. Refused when the email already has
 * `MAX_OTP_REQUESTS` requests or is locked by `MAX_OTP_FAILURES` wrong guesses in the window.
 *
 * The check and the count are one atomic update, so parallel requests cannot pass the limit.
 *
 * @param {string} email - Email the code will be sent to
 * @returns {Promise<boolean>} True when a code may be issued
 * @example
 * if (!(await OTPLimitModel.claimRequest("user@example.com"))) throw new ClientFaultError("Slow down", 429);
 */
otpLimitSchema.statics.claimRequest = async function (email) {
	const now = Date.now();
	// Mongo's TTL monitor runs about once a minute; end a finished window here so it never lingers.
	await this.deleteOne({
		email,
		createdAt: { $lte: new Date(now - OTP_WINDOW_SECONDS * 1000) },
	});

	try {
		await this.findOneAndUpdate(
			{
				email,
				requests: { $not: { $gte: MAX_OTP_REQUESTS } },
				failures: { $not: { $gte: MAX_OTP_FAILURES } },
			},
			{ $inc: { requests: 1 }, $setOnInsert: { createdAt: new Date(now) } },
			{ upsert: true }
		);
		return true;
	} catch (error) {
		// The email's counter exists and failed the filter, so the upsert hit the unique index.
		if (error.code === 11000) return false;
		throw error;
	}
};

/**
 * Counts a wrong guess against the email. Does nothing when the email has no counter,
 * as for a code issued before this counter existed.
 *
 * @param {string} email - Email the wrong code was tried for
 * @returns {Promise<boolean>} True when the email is now locked
 * @example
 * if (await OTPLimitModel.recordFailure("user@example.com")) await OTPModel.deleteOne({ email });
 */
otpLimitSchema.statics.recordFailure = async function (email) {
	const limit = await this.findOneAndUpdate(
		{ email },
		{ $inc: { failures: 1 } },
		{ new: true }
	);
	return Boolean(limit && limit.failures >= MAX_OTP_FAILURES);
};

const OTPLimitModel = model("OTPLimit", otpLimitSchema);

export default OTPLimitModel;

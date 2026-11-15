/**
 * Login Attempt Model - Failed password attempts per client or account key.
 *
 * One counter per key, created by the first login attempt that reaches the password check
 * and deleted by Mongo 15 minutes later or by a successful sign-in. An attempt is counted
 * before its password is checked, so the count is failed attempts once the checks settle.
 * Keys are built in login-risk.middleware.js.
 * @module models/login-attempt
 *
 * @property {string} key - Counter key: `account:<email>`, `anon:<ip>:<user-agent hash>` or `device:<token hash>`
 * @property {number} count - Attempts that reached the password check since createdAt (failed ones, unless a success cleared the counter)
 * @property {Date} createdAt - First counted attempt in the window (TTL 15 minutes)
 */
import { Schema, model } from "mongoose";

const loginAttemptSchema = new Schema({
	key: { type: String, required: true, unique: true },
	count: { type: Number, default: 0 },
	createdAt: { type: Date, expires: 60 * 15 },
});

const LoginAttemptModel = model("LoginAttempt", loginAttemptSchema);

export default LoginAttemptModel;

/**
 * Device Model - Browsers that have signed in to an account before.
 *
 * Only a SHA-256 hash of the device token is stored; the token itself lives in the
 * browser's HttpOnly cookie. A device unused for 180 days is removed.
 * @module models/device
 *
 * @property {Types.ObjectId} user - Account the device signed in to
 * @property {string} tokenHash - SHA-256 hex digest of the device token
 * @property {Date} lastUsedAt - Last successful sign-in from this device (TTL 180 days)
 */
import { Schema, model } from "mongoose";

const deviceSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	tokenHash: { type: String, required: true },
	lastUsedAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 180,
	},
});

deviceSchema.index({ user: 1, tokenHash: 1 }, { unique: true });

const DeviceModel = model("Device", deviceSchema);

export default DeviceModel;

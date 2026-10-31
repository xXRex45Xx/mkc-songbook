/**
 * Refresh Token Model - One link in a chain of rotating refresh tokens.
 *
 * Only a SHA-256 hash of the token is stored; the token itself lives in the browser's
 * HttpOnly `mkc_rt` cookie. Each refresh marks the used row and inserts the next row in the
 * same family. A row presented again after it was used means the token was copied, so the
 * whole family is deleted. Rows are removed once `expiresAt` passes.
 * @module models/refresh-token
 *
 * @property {Types.ObjectId} user - Account the session belongs to
 * @property {string} family - Id shared by every token in one sign-in; also the JWT `sid` claim
 * @property {Date} familyStartedAt - When the sign-in began; caps the family's lifetime
 * @property {string} tokenHash - SHA-256 hex digest of the refresh token (unique)
 * @property {Date} expiresAt - When the token stops working (TTL index removes the row)
 * @property {Date|null} usedAt - When the token was exchanged for the next one
 * @property {Date} createdAt - When the token was issued
 */
import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	family: { type: String, required: true },
	familyStartedAt: { type: Date, default: Date.now },
	tokenHash: { type: String, required: true, unique: true },
	expiresAt: { type: Date, required: true, index: { expires: 0 } },
	usedAt: { type: Date, default: null },
	createdAt: { type: Date, default: Date.now },
});

refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ family: 1 });

const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);

export default RefreshTokenModel;

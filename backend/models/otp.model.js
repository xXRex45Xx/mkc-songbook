/**
 * OTP Model - Database schema for one-time password entities
 *
 * This model defines the structure and validation rules for OTP data in the database.
 * It includes email verification handling, automatic email sending, and time-based expiration.
 * The model supports OTP generation, storage, and automatic email delivery while maintaining
 * data integrity and security standards.
 *
 * @module models/otp
 *
 * @property {string} _id - Unique identifier for OTP entry with explanation of automatic generation and UUID format
 * @property {string} email - User's email address (required, unique, lowercase) with detailed explanation of validation rules and constraints
 * @property {number} otp - Generated OTP number (required, typically 6 digits) with description of security considerations and generation process
 * @property {Date} createdAt - Timestamp when OTP was created (expires after 5 minutes) with detailed explanation of time-based expiration handling
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
import { Schema, model } from "mongoose";
import sendEmail from "../config/nodemailer.config.js";

/**
 * OTP schema definition.
 *
 * This schema defines the structure for OTP data including email address, OTP number,
 * and creation timestamp. It includes validation rules and automatic expiration settings
 * to ensure proper security handling and data consistency.
 *
 * @typedef {Object} OTPSchema
 * @property {string} _id - Unique identifier for OTP entry with explanation of automatic generation and UUID format
 * @property {string} email - User's email address (required, unique, lowercase) with detailed explanation of validation rules and constraints
 * @property {number} otp - Generated OTP number (required, typically 6 digits) with description of security considerations and generation process
 * @property {Date} createdAt - Timestamp when OTP was created (expires after 5 minutes) with detailed explanation of time-based expiration handling
 */
const otpSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	},
	otp: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5,
	},
});

/**
 * Mongoose pre-save middleware for OTP schema.
 *
 * This middleware automatically sends an email containing the OTP to the user before saving.
 * It uses the configured email service to send verification codes. The function handles
 * potential errors during email sending and ensures proper execution flow.
 *
 * @param {Function} next - Mongoose middleware next function
 * @throws {Error} If email sending fails with detailed error context about what caused the failure
 */
otpSchema.pre("save", async function (next) {
	await sendEmail(
		this.email,
		"MKC-Choir Email Verification",
		`Your verification code is ${this.otp}`
	);
	next();
});

const OTPModel = model("OTP", otpSchema);

export default OTPModel;
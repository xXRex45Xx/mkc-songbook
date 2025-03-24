/**
 * One-Time Password (OTP) model module.
 * Defines the schema and model for OTP data used in email verification.
 * Handles OTP generation, storage, and automatic email sending.
 * @module models/otp
 */

import { Schema, model } from "mongoose";
import sendEmail from "../config/nodemailer.config.js";

/**
 * OTP schema definition.
 * @typedef {Object} OTPSchema
 * @property {string} email - User's email address (unique, required, validated with regex)
 * @property {number} otp - Generated OTP number (required, typically 6 digits)
 * @property {Date} createdAt - Timestamp when OTP was created (expires after 5 minutes)
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
 * Automatically sends an email containing the OTP to the user before saving.
 * Uses the configured email service to send verification codes.
 *
 * @param {Function} next - Mongoose middleware next function
 * @throws {Error} If email sending fails
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

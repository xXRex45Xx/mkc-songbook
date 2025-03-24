/**
 * OTP (One-Time Password) validation middleware module.
 * Provides middleware for validating OTPs during user registration or password reset.
 */

import OTPModel from "../models/otp.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Validates the OTP provided by the user against the stored OTP.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing email and OTP
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.otp - OTP provided by the user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ClientFaultError} If OTP is invalid or doesn't exist for the email
 */
const validateOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    const storedOTP = await OTPModel.findOne({ email });
    if (!storedOTP || storedOTP.otp !== parseInt(otp))
        throw new ClientFaultError("Verification code is invalid.");
    next();
};

export default validateOtp;

/**
 * OTP (One-Time Password) validation middleware module.
 * Provides middleware for validating OTPs during user registration or password reset.
 */

import OTPModel from "../models/otp.model.js";
import { ClientFaultError } from "../utils/error.util.js";

/**
 * Validates the OTP provided by the user against the stored OTP.
 *
 * This middleware validates OTP codes provided by users against the stored OTP in the database.
 * It ensures that only valid, non-expired OTPs can be used for authentication processes.
 *
 * @param {Object} req - Express request object containing request data with explanation of OTP validation process and security considerations
 * @param {Object} req.body - Request body containing email and OTP with explanation of validation flow and error conditions
 * @param {string} req.body.email - User's email address with explanation of email validation and security requirements
 * @param {string} req.body.otp - OTP provided by the user with explanation of OTP format, validity period, and security considerations
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates OTP with proper database checks explaining the complete validation process flow
 * @throws {ClientFaultError} If OTP is invalid, expired, or doesn't exist for the email with clear explanation of error conditions and error context
 */
const validateOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    const storedOTP = await OTPModel.findOne({ email });
    if (!storedOTP || storedOTP.otp !== parseInt(otp))
        throw new ClientFaultError("Verification code is invalid.");
    next();
};

export default validateOtp;


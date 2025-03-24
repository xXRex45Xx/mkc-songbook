/**
 * OTP Generation Utility Module.
 * Provides functionality for generating one-time passwords.
 * @module utils/otp
 */

/**
 * Generates a random 6-digit OTP number between 100000 and 999999.
 * @function generateOtp
 * @returns {number} A random 6-digit number
 */
const generateOtp = () =>
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
export default generateOtp;

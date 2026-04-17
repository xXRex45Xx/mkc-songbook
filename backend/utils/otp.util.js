/**
 * OTP Generation Utility Module.
 * Provides functionality for generating one-time passwords.
 * Used for authentication flows requiring temporary verification codes.
 * @module utils/otp
 */

/**
 * Generates a random 6-digit OTP number between 100000 and 999999.
 * Creates a cryptographically random number suitable for use as a one-time password.
 * The range ensures exactly 6 digits and excludes leading zeros.
 *
 * @function generateOtp
 * @returns {number} A random 6-digit number (100000-999999)
 * @example
 * // Generate a 6-digit OTP for user verification
 * const otp = generateOtp();
 * console.log(otp); // e.g., 483729
 */
const generateOtp = () =>
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
export default generateOtp;

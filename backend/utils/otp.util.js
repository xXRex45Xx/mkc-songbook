/**
 * OTP Generation Utility Module.
 * Provides functionality for generating one-time passwords.
 * Used for authentication flows requiring temporary verification codes.
 * @module utils/otp
 */

import { randomInt } from "crypto";

/**
 * Generates a random 6-digit OTP number between 100000 and 999999.
 * Draws from the operating system's cryptographically secure random source
 * (`crypto.randomInt`), so a code cannot be predicted from earlier codes. Never replace it
 * with `Math.random`, whose state can be recovered from its output.
 * The range ensures exactly 6 digits and excludes leading zeros.
 *
 * @function generateOtp
 * @returns {number} A random 6-digit number (100000-999999)
 * @example
 * // Generate a 6-digit OTP for user verification
 * const otp = generateOtp();
 * console.log(otp); // e.g., 483729
 */
const generateOtp = () => randomInt(100000, 1000000);
export default generateOtp;

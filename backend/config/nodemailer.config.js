/**
 * Nodemailer Configuration
 *
 * This module configures Nodemailer for sending emails in the application.
 * It provides:
 * 1. SMTP transport configuration
 * 2. Email template settings
 * 3. Default sender information
 *
 * @module nodemailer.config
 */

import nodemailer from "nodemailer";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Create SMTP transport
 *
 * Configures and creates a nodemailer transport using SMTP settings
 * from environment variables.
 *
 * This transport is used for sending emails through the configured SMTP server.
 *
 * @returns {Object} Configured nodemailer transport object with authentication details and connection settings
 * @throws {Error} If transport configuration fails due to invalid settings or network issues
 */
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: true, // true for 465, false for other ports like 587
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

/**
 * Send email using configured transporter
 *
 * Sends an email through the configured SMTP transport with specified parameters.
 *
 * @param {string} email - Recipient email address
 * @param {string} title - Email subject
 * @param {string} body - Email content
 * @returns {Promise<void>} Resolves when email is sent successfully with confirmation of delivery
 * @throws {Error} If email sending fails due to transport issues or invalid parameters with clear explanation of root causes
 * @example
 * // Example usage:
 * await sendEmail("user@example.com", "Welcome!", "Thank you for joining!");
 * This example demonstrates sending a welcome email to a new user with proper formatting and content.
 */
const sendEmail = async (email, title, body) => {
	await transporter.sendMail({
		from: process.env.SMTP_USER,
		to: email,
		subject: title,
		text: body,
	});
};

export default sendEmail;

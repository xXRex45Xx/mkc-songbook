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
 * @returns {Object} Configured nodemailer transport
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send email using configured transporter
 *
 * @param {string} email - Recipient email address
 * @param {string} title - Email subject
 * @param {string} body - Email content
 * @returns {Promise<void>} Resolves when email is sent
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

/**
 * User Controller
 *
 * This module handles user-related operations including:
 * 1. User registration with OTP verification
 * 2. Google OAuth authentication
 * 3. Password management
 * 4. User profile retrieval
 *
 * @module user.controller
 */

import OTPModel from "../models/otp.model.js";
import generateOtp from "../utils/otp.util.js";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
    ClientFaultError,
    NotFoundError,
    UnauthorizedError,
} from "../utils/error.util.js";

/**
 * Generate and send OTP for user registration
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status
 */
export const registerOTP = async (req, res) => {
    const { email } = req.body;
    let otp = generateOtp();
    const current = await OTPModel.findOne({ email });
    if (current) {
        current.otp = otp;
        current.createdAt = Date.now();
        current.save();
    } else await OTPModel.create({ otp, email });
    res.status(200).json({ success: true });
};

/**
 * Verify OTP for user registration
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string|number} req.body.otp - OTP to verify
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with verification status
 * @throws {ClientFaultError} If OTP is invalid
 */
export const verifyOTP = async (req, res) => {
    let { email, otp } = req.body;
    if (typeof otp === "string") otp = parseInt(otp);
    const storedOtp = await OTPModel.findOne({ email, otp });
    if (!storedOtp)
        throw new ClientFaultError("The verification code is invalid");
    return res.status(200).json({ success: true });
};

/**
 * Register a new user
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user data and JWT token
 */
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30 days",
    });
    res.status(201).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
    await OTPModel.deleteOne({ email });
};

/**
 * Get current user's profile
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user profile
 */
export const getCurrentUser = async (req, res) => {
    res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

/**
 * Handle Google OAuth login/registration
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.accessToken - Google OAuth access token
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user data and JWT token
 * @throws {UnauthorizedError} If Google OAuth verification fails
 */
export const googleOAuthLogin = async (req, res) => {
    const { accessToken } = req.body;

    const googleApiResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );

    if (!googleApiResponse.ok) {
        throw new UnauthorizedError(
            "Failed to sign up or login with google. Please, try again."
        );
    }

    const googleApiData = await googleApiResponse.json();
    let user = await UserModel.findOne({ email: googleApiData.email });

    if (!user)
        user = await UserModel.create({
            email: googleApiData.email,
            name: googleApiData.name,
            photo: googleApiData.picture,
        });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30 days",
    });

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

/**
 * Reset user's password
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - New password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status
 */
export const resetPassword = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });
    res.status(200).json({ success: true });
    await OTPModel.deleteOne({ email });
};

export const getAllOrSearchUsers = async (req, res) => {
    const { q, page = 1, type } = req.query;
    let users, totalPages;
    if (!q) {
        users = await UserModel.find(
            {},
            { name: true, email: true, role: true }
        )
            .sort("name")
            .skip((page - 1) * 100)
            .limit(100);
        const totalDocuments = await UserModel.find({}).countDocuments();
        totalPages = Math.floor(totalDocuments / 100) + 1;
    } else {
        let query = {};
        if (type === "name") query = { name: { $regex: q, $options: "i" } };
        else if (type === "email")
            query = { email: { $regex: q, $options: "i" } };
        else
            query = {
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { email: { $regex: q, $options: "i" } },
                ],
            };

        const queryPromises = [
            UserModel.find(query, {
                name: true,
                email: true,
                role: true,
            })
                .sort("name")
                .skip((page - 1) * 100)
                .limit(100),
            UserModel.find(query).countDocuments(),
        ];
        const [usersFromDb, totalDocuments] = await Promise.all(queryPromises);
        totalPages = Math.floor(totalDocuments / 100) + 1;
        users = usersFromDb;
    }
    res.status(200).json({
        users,
        totalPages,
    });
};

export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    if (user.role === "super-admin")
        throw new ClientFaultError("Super admin role cannot be changed");
    if (req.user.role !== "super-admin" && user.role === "admin")
        throw new ForbiddenError("You are not authorized to change this role");
    user.role = role;
    await user.save();
    res.status(200).json({ updated: true });
};

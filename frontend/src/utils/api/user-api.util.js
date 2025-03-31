import backendURL from "../../config/backend-url.config";
import { emailRegex } from "../regex.util";

/**
 * @fileoverview User API utility functions
 * Contains functions for user authentication and management
 */

/**
 * Requests an OTP for email verification
 * @param {string} email - User's email address
 * @param {boolean} forgotPassword - If true, OTP is for password reset
 * @returns {Promise<Object>} Success response from server
 * @throws {Object} Validation errors or server error response
 */
export const requestOTP = async (email, forgotPassword) => {
    if (!emailRegex.test(email))
        throw { message: "Please enter a valid email address.", status: 400 };

    const response = await fetch(
        `${backendURL}/api/user/otp${
            forgotPassword ? "?forgotPassword=true" : ""
        }`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
            }),
        }
    );
    const data = await response.json();

    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

/**
 * Verifies an OTP sent to user's email
 * @param {Object} params - Verification parameters
 * @param {string} params.email - User's email address
 * @param {string|number} params.otp - OTP to verify
 * @returns {Promise<Object>} Success response from server
 * @throws {Object} Validation errors or server error response
 */
export const verifyOTP = async ({ email, otp }) => {
    if (!otp)
        throw { message: "Please enter your verificaton code.", status: 400 };
    if (typeof otp === "string") otp = parseInt(otp);
    if (isNaN(parseInt(otp)))
        throw { message: "Only numbers are allowed.", status: 400 };
    if (otp < 100000 || otp > 999999)
        throw {
            message: "Verification code is a 6 digit number.",
            status: 400,
        };

    const response = await fetch(`${backendURL}/api/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            otp,
        }),
    });
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

/**
 * Registers a new user
 * @param {string} email - User's email address
 * @param {string|number} otp - Verified OTP
 * @param {string} password - User's password
 * @param {string} confirmPass - Password confirmation
 * @param {string} name - User's name
 * @returns {Promise<Object>} User data and authentication token
 * @throws {Object} Validation errors or server error response
 */
export const registerUser = async (email, otp, password, confirmPass, name) => {
    const error = { status: 400 };
    let errorOccured = false;

    if (!password || password.length < 8) {
        errorOccured = true;
        error.passwordMessage = "Password must be atleast 8 characters.";
    }
    if (!name) {
        errorOccured = true;
        error.nameMessage = "Name is required.";
    }
    if (password !== confirmPass) {
        errorOccured = true;
        error.confirmPassMessage = "Passwords don't match.";
    }
    if (errorOccured) throw error;

    const response = await fetch(`${backendURL}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            otp,
            password,
            name,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

/**
 * Authenticates a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and authentication token
 * @throws {Object} Validation errors or server error response
 */
export const login = async (email, password) => {
    const error = { status: 400 };
    let errorOccured = false;
    if (!emailRegex.test(email)) {
        errorOccured = true;
        error.emailMessage = "Please enter a valid email address.";
    }
    if (!password || password.length < 8) {
        errorOccured = true;
        error.passwordMessage = "Password must be atleast 8 characters";
    }
    if (errorOccured) throw error;

    const response = await fetch(`${backendURL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) throw { message: data.message, status: response.status };

    return { success: true, ...data };
};

/**
 * Fetches currently logged in user's data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Current user data
 * @throws {Object} Authentication error or server error response
 */
export const getCurrentLoggedInUser = async (token) => {
    const response = await fetch(`${backendURL}/api/user/current-user`, {
        method: "GET",
        headers: {
            Authorization: `bearer ${token}`,
        },
    });
    if (response.status === 401) throw { status: response.status };
    const data = await response.json();

    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

/**
 * Resets user's password
 * @param {string} email - User's email address
 * @param {string|number} otp - Verified OTP
 * @param {string} password - New password
 * @param {string} confirmPass - New password confirmation
 * @returns {Promise<Object>} Success response from server
 * @throws {Object} Validation errors or server error response
 */
export const resetPassword = async (email, otp, password, confirmPass) => {
    const error = { status: 400 };
    let errorOccured = false;

    if (!password || password.length < 8) {
        errorOccured = true;
        error.passwordMessage = "Password must be atleast 8 characters.";
    }
    if (password !== confirmPass) {
        errorOccured = true;
        error.confirmPassMessage = "Passwords don't match.";
    }
    if (errorOccured) throw error;

    const response = await fetch(`${backendURL}/api/user/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            otp,
            password,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

/**
 * Authenticates user with Google OAuth
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Object>} User data and authentication token
 * @throws {Object} Authentication error or server error response
 */
export const googleOauthLogin = async (accessToken) => {
    const error = {
        message: "Failed to sign up or login with google. Please, try again.",
        status: 401,
    };
    if (!accessToken) throw error;

    const response = await fetch(`${backendURL}/api/user/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            accessToken,
        }),
    });

    if (!response.ok) throw error;

    const data = await response.json();
    return data;
};

export const getAllOrSearchUsers = async (
    searchQuery = null,
    page = 1,
    token = localStorage.getItem("_s")
) => {
    const response = await fetch(
        `${backendURL}/api/user?page=${page}${
            searchQuery.q ? "&q=" + searchQuery.q : ""
        }${searchQuery.type ? "&type=" + searchQuery.type : ""}`,
        {
            headers: {
                Authorization: `bearer ${token}`,
            },
        }
    );
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

import backendURL from "../../config/backend-url.config";
import { emailRegex } from "../regex.util";

export const requestOTP = async (email) => {
    if (!emailRegex.test(email))
        throw { message: "Please enter a valid email address.", status: 400 };

    const response = await fetch(`${backendURL}/api/user/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
        }),
    });
    const data = await response.json();

    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

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
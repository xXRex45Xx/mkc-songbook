import backendURL from "../../config/backend-url.config";
import { sendMutation } from "../pwa/write-queue.util";
import { apiFetch } from "./api-client.util";
import {
	clearLegacyToken,
	endSession,
	getLegacyToken,
	isLogoutPending,
	isSignedIn,
	setLogoutPending,
	setSignedIn,
	startSession,
} from "../session.util";
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

	const response = await apiFetch(
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

	const response = await apiFetch(`${backendURL}/api/user/verify-otp`, {
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
 * @returns {Promise<Object>} User data; the server sets the session cookies
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

	const response = await apiFetch(`${backendURL}/api/user`, {
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
 * @param {string} [captchaToken] - Turnstile token, sent when the server asked for a captcha
 * @returns {Promise<Object>} User data; the server sets the session cookies
 * @throws {Object} Validation errors or server error response; `code` is `CAPTCHA_REQUIRED` when a captcha must be solved
 */
export const login = async (email, password, captchaToken) => {
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

	const response = await apiFetch(`${backendURL}/api/user/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email,
			password,
			...(captchaToken ? { captchaToken } : {}),
		}),
	});

	const data = await response.json();

	if (!response.ok)
		throw { message: data.message, status: response.status, code: data.code };

	return { success: true, ...data };
};

/**
 * Fetches currently logged in user's data
 * @returns {Promise<Object>} Current user data
 * @throws {Object} Authentication error (401 once the session cannot be renewed) or server
 *   error response
 */
export const getCurrentLoggedInUser = async () => {
	const response = await apiFetch(`${backendURL}/api/user/current-user`);
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

	const response = await apiFetch(`${backendURL}/api/user/reset-password`, {
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
 * @returns {Promise<Object>} User data; the server sets the session cookies
 * @throws {Object} Authentication error or server error response
 */
export const googleOauthLogin = async (accessToken) => {
	const error = {
		message: "Failed to sign up or login with google. Please, try again.",
		status: 401,
	};
	if (!accessToken) throw error;

	const response = await apiFetch(`${backendURL}/api/user/google/callback`, {
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

/**
 * Fetches all users with pagination and search
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search query string
 * @param {string} [searchQuery.type] - Search type
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} User data from the server
 * @throws {Object} Error with message and status if request fails
 */
export const getAllOrSearchUsers = async (searchQuery = null, page = 1) => {
	const response = await apiFetch(
		`${backendURL}/api/user?page=${page}${
			searchQuery.q ? "&q=" + searchQuery.q : ""
		}${searchQuery.type ? "&type=" + searchQuery.type : ""}`
	);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};

/**
 * Updates user role
 * @param {string} id - User ID to update
 * @param {string} role - New role to assign
 * @returns {Promise<Object>} Updated user data
 * @throws {Object} Validation errors or server error response
 */
export const updateUserRole = async (id, role) => {
	const response = await apiFetch(`${backendURL}/api/user/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			role,
		}),
	});

	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};

/**
 * Updates user's favorite songs
 * @param {string[]} [favorites] - Array of favorite song IDs
 * @param {string|string[]} [addSongs] - Song ID(s) to add to favorites
 * @param {string|string[]} [removeSongs] - Song ID(s) to remove from favorites
 * @returns {Promise<void>}
 * @throws {Object} Validation errors or server error response
 */
export const updateFavoriteSongs = async (
	favorites,
	addSongs = null,
	removeSongs = null
) => {
	if (!favorites && !addSongs && !removeSongs)
		throw { message: "Invalid request.", status: 400 };
	if (typeof removeSongs === "string") removeSongs = [removeSongs];
	if (typeof addSongs === "string") addSongs = [addSongs];
	const data = await sendMutation({
		url: `${backendURL}/api/user/update-favorites`,
		method: "PATCH",
		body: JSON.stringify({
			favorites: favorites ? favorites : undefined,
			addSongs: addSongs ? addSongs : undefined,
			removeSongs: removeSongs ? removeSongs : undefined,
		}),
		headers: { "Content-Type": "application/json" },
		label: "Update favorites",
	});

	// Queued offline: the local Redux state already carries the change, and
	// the replay happens on the next sync.
	if (data?.queued) return;
	if (!data?.updated) throw { message: "An unexpected error occurred." };
};

/**
 * Fetches user's favorite songs
 * @returns {Promise<Object>} Favorite songs data
 * @throws {Object} Error with message and status if request fails
 */
export const getFavorites = async () => {
	const response = await apiFetch(`${backendURL}/api/user/favorites`);

	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};

/**
 * Signs out of this browser: the server deletes the session and clears the cookies
 * @returns {Promise<void>}
 * @throws {Error} If the server is unreachable or refuses; the caller still ends the local session
 */
export const logout = async () => {
	const response = await apiFetch(
		`${backendURL}/api/user/session/logout`,
		{ method: "POST" },
		{ refresh: false }
	);
	if (!response.ok) throw new Error(`Sign-out refused with status ${response.status}.`);
};

/**
 * Trades a login token from before the cookie session for a cookie session. Transition only.
 * @param {string} legacyToken - Token left in localStorage by an older version of the app
 * @returns {Promise<Object>} The signed-in user
 * @throws {Object} Error with message and status if the token is no longer valid
 */
export const upgradeLegacySession = async (legacyToken) => {
	const response = await apiFetch(
		`${backendURL}/api/user/session/upgrade`,
		{
			method: "POST",
			headers: { Authorization: `Bearer ${legacyToken}` },
		},
		{ refresh: false }
	);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data.user;
};

/**
 * Signs out: tells the server, then ends the session on this device. If the server cannot be
 * reached the device is signed out anyway, and the server call is retried by
 * `retryPendingLogout`.
 * @returns {Promise<void>}
 */
export const signOut = async () => {
	try {
		await logout();
	} catch (error) {
		console.warn("Could not reach the server to sign out; will retry:", error);
		setLogoutPending(true);
	}
	await endSession();
};

/**
 * Sends a sign-out that failed earlier. Skipped when someone has signed in since, because the
 * cookies then belong to the new session and must not be revoked.
 * @returns {Promise<void>}
 */
export const retryPendingLogout = async () => {
	if (!isLogoutPending()) return;
	if (isSignedIn()) return setLogoutPending(false);

	try {
		await logout();
		setLogoutPending(false);
	} catch {
		// Still offline: try again on the next sync.
	}
};

/**
 * Trades a login token left in localStorage by a version of the app from before the cookie
 * session for a cookie session, then removes the token. A token the server refuses is dropped.
 * On a network or server failure the token is kept and the browser is marked signed in, so an
 * offline start still shows the cached user; the next sync tries again. Remove with the
 * server's `/api/user/session/upgrade` route once legacy tokens have expired.
 * @returns {Promise<void>}
 */
export const migrateLegacyToken = async () => {
	const legacyToken = getLegacyToken();
	if (!legacyToken) return;

	try {
		const user = await upgradeLegacySession(legacyToken);
		clearLegacyToken();
		await startSession(user);
	} catch (error) {
		if (typeof error?.status === "number" && error.status < 500) return clearLegacyToken();
		setSignedIn(true);
	}
};

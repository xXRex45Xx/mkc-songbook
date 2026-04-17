/**
 * @fileoverview User state management slice
 * Manages user authentication, profile, and session state
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * User slice for Redux store
 * Handles authentication flow, user profile, and role management
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const userSlice = createSlice({
	name: "user",
	initialState: {
		authEmail: "",
		authOtp: "",
		forgotEmail: "",
		currentUser: null,
		adminType: null,
	},
	reducers: {
		/**
		 * Sets email for authentication flow
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with email string as payload
		 * @param {string} action.payload - Email address for authentication
		 */
		setAuthEmail: (state, action) => {
			state.authEmail = action.payload;
		},
		/**
		 * Sets OTP for authentication verification
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with OTP string as payload
		 * @param {string} action.payload - One-time password for verification
		 */
		setAuthOtp: (state, action) => {
			state.authOtp = action.payload;
		},
		/**
		 * Resets authentication state
		 * Clears email and OTP for new authentication flow
		 * @param {Object} state - Current state
		 */
		resetAuth: (state, _action) => {
			state.authEmail = "";
			state.authOtp = "";
		},
		/**
		 * Sets current user data after successful authentication
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with user object as payload
		 * @param {Object} action.payload - User profile data
		 * @param {string} action.payload.id - User identifier
		 * @param {string} action.payload.email - User email
		 * @param {string} action.payload.name - User display name
		 * @param {string} action.payload.role - User role
		 */
		setCurrentUser: (state, action) => {
			state.currentUser = action.payload;
		},
		/**
		 * Resets current user data
		 * Used for logout - clears user profile from state
		 * @param {Object} state - Current state
		 */
		resetCurrentUser: (state, _action) => {
			state.currentUser = null;
		},
		/**
		 * Sets email for password reset flow
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with email string as payload
		 * @param {string} action.payload - Email for password reset
		 */
		setForgotPassEmail: (state, action) => {
			state.forgotEmail = action.payload;
		},
		/**
		 * Updates user favorites list
		 * Merges favorites into existing user profile
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with favorites array as payload
		 * @param {Array<string>} action.payload - Array of favorite song IDs
		 */
		setUserFavorites: (state, action) => {
			state.currentUser = {
				...state.currentUser,
				favorites: action.payload,
			};
		},
		/**
		 * Sets admin type for role toggling
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with admin type as payload
		 * @param {string} action.payload - Admin role type ('admin' or 'super-admin')
		 */
		setAdminType: (state, action) => {
			state.adminType = action.payload;
		},
		/**
		 * Toggles between admin and member role
		 * Switches user role based on current adminType setting
		 * @param {Object} state - Current state
		 * @throws {void} No-op if adminType or currentUser is not set
		 */
		toggleRole: (state) => {
			if (!state.adminType || !state.currentUser) return;
			if (state.currentUser.role === state.adminType) {
				state.currentUser.role = "member";
			} else {
				state.currentUser.role = state.adminType;
			}
		},
	},
});

export const {
	setAuthEmail,
	setAuthOtp,
	resetAuth,
	setCurrentUser,
	resetCurrentUser,
	setForgotPassEmail,
	setUserFavorites,
	setAdminType,
	toggleRole,
} = userSlice.actions;
export default userSlice.reducer;

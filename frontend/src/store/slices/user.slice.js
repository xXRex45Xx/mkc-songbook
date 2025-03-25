/**
 * @fileoverview User state management slice
 * Manages user authentication and profile state
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * User slice for Redux store
 * Handles authentication flow and user data
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const userSlice = createSlice({
    name: "user",
    initialState: {
        authEmail: "",
        authOtp: "",
        forgotEmail: "",
        currentUser: null,
    },
    reducers: {
        /**
         * Sets email for authentication flow
         * @param {Object} state - Current state
         * @param {Object} action - Action with email as payload
         */
        setAuthEmail: (state, action) => {
            state.authEmail = action.payload;
        },
        /**
         * Sets OTP for authentication flow
         * @param {Object} state - Current state
         * @param {Object} action - Action with OTP as payload
         */
        setAuthOtp: (state, action) => {
            state.authOtp = action.payload;
        },
        /**
         * Resets authentication state
         * Clears email and OTP
         * @param {Object} state - Current state
         */
        resetAuth: (state, _action) => {
            state.authEmail = "";
            state.authOtp = "";
        },
        /**
         * Sets current user data
         * @param {Object} state - Current state
         * @param {Object} action - Action with user data as payload
         */
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        /**
         * Resets current user data
         * Used for logout
         * @param {Object} state - Current state
         */
        resetCurrentUser: (state, _action) => {
            state.currentUser = null;
        },
        /**
         * Sets email for password reset flow
         * @param {Object} state - Current state
         * @param {Object} action - Action with email as payload
         */
        setForgotPassEmail: (state, action) => {
            state.forgotEmail = action.payload;
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
} = userSlice.actions;
export default userSlice.reducer;

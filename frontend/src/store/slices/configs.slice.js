/**
 * @fileoverview Configuration state management slice
 * Manages application-wide configuration state like font size, window dimensions, and header visibility
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Configuration slice for Redux store
 * Handles app-wide settings and display preferences
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const configsSlice = createSlice({
	name: "configs",
	initialState: {
		/**
		 * Lyrics display font size in pixels
		 * @type {string}
		 */
		lyricsFontSize: "15",
		/**
		 * Current window inner width in pixels
		 * @type {number}
		 */
		windowWidth: window.innerWidth,
		/**
		 * Whether header is hidden (fullscreen mode)
		 * @type {boolean}
		 */
		hiddenHeader: false,
	},
	reducers: {
		/**
		 * Updates lyrics font size
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with font size string as payload
		 * @param {string} action.payload - Font size value (e.g., '12', '18')
		 */
		setLyricsFontSize: (state, action) => {
			state.lyricsFontSize = action.payload;
		},
		/**
		 * Updates window inner width
		 * Used for responsive layout adjustments
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with window width number as payload
		 * @param {number} action.payload - Window width in pixels
		 */
		setWindowInnerWidth: (state, action) => {
			state.windowWidth = action.payload;
		},
		/**
		 * Sets header visibility state
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with boolean as payload
		 * @param {boolean} action.payload - Whether header should be hidden
		 */
		setHiddenHeader: (state, action) => {
			state.hiddenHeader = action.payload;
		},
		/**
		 * Toggles fullscreen mode
		 * Shows/hides header and enters browser fullscreen
		 * @param {Object} state - Current state
		 */
		toggleFullscreen: (state) => {
			if (state.hiddenHeader) document.exitFullscreen();
			else document.documentElement.requestFullscreen();
			state.hiddenHeader = !state.hiddenHeader;
		},
	},
});

export const {
	setLyricsFontSize,
	setWindowInnerWidth,
	setHiddenHeader,
	toggleFullscreen,
} = configsSlice.actions;
export default configsSlice.reducer;

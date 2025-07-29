/**
 * @fileoverview Configuration state management slice
 * Manages application-wide configuration state like font size and window dimensions
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Configuration slice for Redux store
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const configsSlice = createSlice({
	name: "configs",
	initialState: {
		lyricsFontSize: "15",
		windowWidth: window.innerWidth,
		hiddenHeader: false,
	},
	reducers: {
		/**
		 * Updates lyrics font size
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with new font size as payload
		 */
		setLyricsFontSize: (state, action) => {
			state.lyricsFontSize = action.payload;
		},
		/**
		 * Updates window inner width
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with new width as payload
		 */
		setWindowInnerWidth: (state, action) => {
			state.windowWidth = action.payload;
		},
		setHiddenHeader: (state, action) => {
			state.hiddenHeader = action.payload;
		},
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

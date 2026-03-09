/**
 * @fileoverview Main Redux store configuration
 * Combines all reducer slices into a single Redux store instance
 */

import { configureStore } from "@reduxjs/toolkit";
import configsReducer from "./slices/configs.slice";
import userReducer from "./slices/user.slice";
import playlistReducer from "./slices/playlist.slice";

/**
 * Main Redux store instance
 * Combines configs, user, and playlist reducers into a single store
 * @type {import('@reduxjs/toolkit').EnhancedStore}
 */
export default configureStore({
	reducer: {
		/**
		 * Configuration state reducer
		 * Manages app-wide settings like font size and window dimensions
		 */
		configs: configsReducer,
		/**
		 * User state reducer
		 * Manages authentication and user profile data
		 */
		user: userReducer,
		/**
		 * Playlist state reducer
		 * Manages song queue and playback state
		 */
		playlist: playlistReducer,
	},
});

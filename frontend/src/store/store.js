/**
 * @fileoverview Redux store configuration
 * Configures the main Redux store with all reducers
 */

import { configureStore } from "@reduxjs/toolkit";
import configsReducer from "./slices/configs.slice";
import userReducer from "./slices/user.slice";
import playlistReducer from "./slices/playlist.slice";

/**
 * Main Redux store instance
 * Combines configs and user reducers
 * @type {import('@reduxjs/toolkit').EnhancedStore}
 */
export default configureStore({
	reducer: {
		configs: configsReducer,
		user: userReducer,
		playlist: playlistReducer,
	},
});

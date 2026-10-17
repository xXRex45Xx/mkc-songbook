/**
 * @fileoverview PWA state management slice
 * Manages offline readiness, update availability, and sync status
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Initial state for PWA slice
 * @type {Object}
 * @property {boolean} offlineReady - Whether app is ready for offline use
 * @property {boolean} needRefresh - Whether a new SW version is available
 * @property {string|null} lastSyncTime - ISO timestamp of last successful sync
 * @property {boolean} isSyncing - Whether a sync operation is in progress
 * @property {string|null} syncError - Error message if sync failed
 */
const initialState = {
  offlineReady: false,
  needRefresh: false,
  lastSyncTime: null,
  isSyncing: false,
  syncError: null,
};

const pwaSlice = createSlice({
  name: "pwa",
  initialState,
  reducers: {
    setOfflineReady: (state, action) => {
      state.offlineReady = action.payload;
    },
    setNeedRefresh: (state, action) => {
      state.needRefresh = action.payload;
    },
    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },
    setSyncComplete: (state) => {
      state.isSyncing = false;
      state.lastSyncTime = new Date().toISOString();
      state.syncError = null;
    },
    setSyncError: (state, action) => {
      state.isSyncing = false;
      state.syncError = action.payload;
    },
  },
});

export const {
  setOfflineReady,
  setNeedRefresh,
  setSyncing,
  setSyncComplete,
  setSyncError,
} = pwaSlice.actions;

export default pwaSlice.reducer;

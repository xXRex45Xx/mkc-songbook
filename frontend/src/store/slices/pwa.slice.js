/**
 * @fileoverview PWA state management slice
 * Manages offline readiness, connectivity, and sync status
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Initial state for PWA slice
 * @type {Object}
 * @property {boolean} offlineReady - Whether the app shell is cached for offline use
 * @property {boolean} isOnline - Whether the browser currently reports a connection
 * @property {string|null} lastSyncTime - ISO timestamp of last successful sync
 * @property {boolean} isSyncing - Whether a sync operation is in progress
 * @property {string|null} syncError - Error message if sync failed
 * @property {Object|null} lastSyncCounts - Per-resource record counts from the last sync
 * @property {number} pendingWrites - Mutations waiting to reach the server
 * @property {number} failedWrites - Queued mutations the server permanently rejected
 * @property {Object<string, number>} audioDownloads - Whole-percent progress (0-100) of audio saves in flight, by song id
 */
const initialState = {
  offlineReady: false,
  isOnline: true,
  lastSyncTime: null,
  isSyncing: false,
  syncError: null,
  lastSyncCounts: null,
  pendingWrites: 0,
  failedWrites: 0,
  isInstallable: false,
  isInstalled: false,
  swError: null,
  audioDownloads: {},
};

const pwaSlice = createSlice({
  name: "pwa",
  initialState,
  reducers: {
    setOfflineReady: (state, action) => {
      state.offlineReady = action.payload;
    },
    setOnline: (state, action) => {
      state.isOnline = action.payload;
    },
    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },
    setLastSyncTime: (state, action) => {
      state.lastSyncTime = action.payload;
    },
    setSyncComplete: (state, action) => {
      state.isSyncing = false;
      state.lastSyncTime = new Date().toISOString();
      state.syncError = null;
      if (action.payload) {
        state.lastSyncCounts = action.payload;
      }
    },
    setSyncError: (state, action) => {
      state.isSyncing = false;
      state.syncError = action.payload;
    },
    setSwError: (state, action) => {
      state.swError = action.payload;
    },
    setWriteQueueSummary: (state, action) => {
      state.pendingWrites = action.payload?.pending || 0;
      state.failedWrites = action.payload?.failed || 0;
    },
    setInstallable: (state, action) => {
      state.isInstallable = action.payload;
    },
    setAudioDownloadProgress: (state, action) => {
      const { songId, percent } = action.payload;
      state.audioDownloads[songId] = percent;
    },
    clearAudioDownload: (state, action) => {
      delete state.audioDownloads[action.payload];
    },
    setInstalled: (state, action) => {
      state.isInstalled = action.payload;
    },
  },
});

export const {
  setOfflineReady,
  setOnline,
  setSyncing,
  setLastSyncTime,
  setSyncComplete,
  setSyncError,
  setSwError,
  setWriteQueueSummary,
  setInstallable,
  setInstalled,
  setAudioDownloadProgress,
  clearAudioDownload,
} = pwaSlice.actions;

export default pwaSlice.reducer;

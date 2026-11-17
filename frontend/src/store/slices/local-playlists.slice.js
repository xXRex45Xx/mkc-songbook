/**
 * @fileoverview Local playlists state management slice
 * Manages playlists stored in IndexedDB
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Local playlists slice for Redux store
 * Handles local-only playlists stored in browser IndexedDB
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const localPlaylistsSlice = createSlice({
  name: "localPlaylists",
  initialState: {
    /**
     * Array of locally stored playlist objects
     * @type {Array<Object>}
     */
    localPlaylists: [],
    /**
     * Loading state for async operations
     * @type {boolean}
     */
    isLoading: false,
  },
  reducers: {
    /**
     * Sets all local playlists from IndexedDB
     * @param {Object} state - Current state
     * @param {Object} action - Action with playlist array as payload
     */
    setLocalPlaylists: (state, action) => {
      state.localPlaylists = action.payload;
    },
    /**
     * Adds a new local playlist to state
     * @param {Object} state - Current state
     * @param {Object} action - Action with playlist object as payload
     */
    addLocalPlaylist: (state, action) => {
      state.localPlaylists = [action.payload, ...state.localPlaylists];
    },
    /**
     * Updates an existing local playlist in state
     * @param {Object} state - Current state
     * @param {Object} action - Action with { id, updates } as payload
     */
    updateLocalPlaylist: (state, action) => {
      const { id, updates } = action.payload;
      const idx = state.localPlaylists.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.localPlaylists[idx] = {
          ...state.localPlaylists[idx],
          // An edit after an upload must reach the server copy too.
          synced: false,
          ...updates,
        };
      }
    },
    /**
     * Removes a local playlist from state
     * @param {Object} state - Current state
     * @param {Object} action - Action with playlist ID as payload
     */
    deleteLocalPlaylist: (state, action) => {
      state.localPlaylists = state.localPlaylists.filter(
        (p) => p.id !== action.payload
      );
    },
    /**
     * Marks a playlist as synced with server
     * @param {Object} state - Current state
     * @param {Object} action - Action with { id, remoteId } as payload
     */
    markAsSynced: (state, action) => {
      const { id, remoteId } = action.payload;
      const idx = state.localPlaylists.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.localPlaylists[idx].synced = true;
        state.localPlaylists[idx].remoteId = remoteId;
      }
    },
    /**
     * Sets loading state
     * @param {Object} state - Current state
     * @param {Object} action - Action with boolean as payload
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setLocalPlaylists,
  addLocalPlaylist,
  updateLocalPlaylist,
  deleteLocalPlaylist,
  markAsSynced,
  setLoading,
} = localPlaylistsSlice.actions;

export default localPlaylistsSlice.reducer;

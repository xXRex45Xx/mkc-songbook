/**
 * @fileoverview Playlist state management slice
 * Manages song queue, playback position, and repeat mode
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Playlist slice for Redux store
 * Handles song queue management, playback controls, and repeat modes
 * @type {import('@reduxjs/toolkit').Slice}
 */
export const configsSlice = createSlice({
	name: "playlist",
	initialState: {
		/**
		 * Array of song objects in the playback queue
		 * @type {Array<Object>}
		 */
		queue: [],
		/**
		 * Index of currently playing song (-1 if queue is empty)
		 * @type {number}
		 */
		currentSongIdx: -1,
		/**
		 * Repeat mode: 'no-repeat', 'repeat-all', or 'repeat-current'
		 * @type {string}
		 */
		repeat: "no-repeat",
	},
	reducers: {
		/**
		 * Sets the entire playlist queue
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with playlist array as payload
		 * @param {Array<Object>} action.payload - Array of song objects
		 * @param {string} action.payload._id - Song identifier
		 * @param {string} action.payload.title - Song title
		 * Initializes first song index if queue is empty
		 */
		setPlaylist: (state, action) => {
			state.queue = action.payload;
			if (state.currentSongIdx === -1) state.currentSongIdx = 0;
		},
		/**
		 * Adds a song to the queue
		 * Moves song to end of queue if not already present
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with song object as payload
		 * @param {Object} action.payload - Song to add
		 * @param {string} action.payload._id - Song identifier
		 * @param {string} action.payload.title - Song title
		 */
		addSongToQueue: (state, action) => {
			if (!action.payload || !action.payload._id) return;
			const songIdxInQueue = state.queue.findIndex(
				(song) => song._id === action.payload._id
			);
			if (songIdxInQueue < 0) state.queue = [...state.queue, action.payload];
			else if (songIdxInQueue < state.queue.length - 1) {
				let temp = state.queue.slice(0, songIdxInQueue);
				temp = temp.concat(state.queue.slice(songIdxInQueue + 1));
				temp.push(action.payload);
				state.queue = temp;
			}
			if (state.currentSongIdx === -1) state.currentSongIdx = 0;
		},
		/**
		 * Sets the current song index
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with index number as payload
		 * @param {number} action.payload - Zero-based song index
		 */
		setCurrentSongIdx: (state, action) => {
			if (action.payload >= 0 && action.payload <= state.queue.length - 1)
				state.currentSongIdx = action.payload;
		},
		/**
		 * Plays a song next in the queue
		 * Reorders queue to play the song immediately after current
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with song object as payload
		 * @param {Object} action.payload - Song to play next
		 * @param {string} action.payload._id - Song identifier
		 * @param {string} action.payload.title - Song title
		 */
		playNext: (state, action) => {
			if (!action.payload || !action.payload._id) return;
			const songIdxInQueue = state.queue.findIndex(
				(song) => song._id === action.payload._id
			);
			let temp = [];
			if (songIdxInQueue < 0) {
				if (state.currentSongIdx === -1) {
					temp = [action.payload, ...state.queue];
					state.currentSongIdx = 0;
				} else {
					temp = state.queue.slice(0, state.currentSongIdx + 1);
					temp.push(action.payload);
					if (state.currentSongIdx < state.queue.length - 1)
						temp = temp.concat(
							state.queue.slice(state.currentSongIdx + 1)
						);
				}
			} else {
				if (state.currentSongIdx === -1) {
					temp.push(action.payload);
					temp = temp.concat(state.queue.slice(0, songIdxInQueue));
					if (songIdxInQueue < state.queue.length - 1)
						temp = temp.concat(state.queue.slice(songIdxInQueue + 1));
					state.currentSongIdx = 0;
				} else {
					if (state.currentSongIdx < songIdxInQueue) {
						temp = state.queue.slice(0, state.currentSongIdx + 1);
						temp.push(action.payload);
						temp = temp.concat(
							state.queue.slice(state.currentSongIdx + 1, songIdxInQueue)
						);
						if (songIdxInQueue < state.queue.length - 1)
							temp = temp.concat(state.queue.slice(songIdxInQueue + 1));
					} else if (state.currentSongIdx === songIdxInQueue)
						temp = state.queue;
					else {
						temp = state.queue.slice(0, songIdxInQueue);
						temp = temp.concat(
							state.queue.slice(
								songIdxInQueue + 1,
								state.currentSongIdx + 1
							)
						);
						temp.push(action.payload);
						if (state.currentSongIdx < state.queue.length - 1)
							temp = temp.concat(
								state.queue.slice(state.currentSongIdx + 1)
							);
					}
				}
			}
			state.queue = temp;
		},
		/**
		 * Advances to the next song in the queue
		 * @param {Object} state - Current state
		 */
		nextSong: (state) => {
			if (state.currentSongIdx < state.queue.length - 1)
				state.currentSongIdx++;
		},
		/**
		 * Moves to the previous song in the queue
		 * @param {Object} state - Current state
		 */
		prevSong: (state) => {
			if (state.currentSongIdx !== 0) state.currentSongIdx--;
		},
		/**
		 * Toggles repeat mode
		 * Cycles through: no-repeat -> repeat-all -> repeat-current -> no-repeat
		 * @param {Object} state - Current state
		 */
		toggleRepeat: (state) => {
			if (state.repeat === "no-repeat") state.repeat = "repeat-all";
			else if (state.repeat === "repeat-all")
				state.repeat = "repeat-current";
			else if (state.repeat === "repeat-current") state.repeat = "no-repeat";
		},
		/**
		 * Removes a song from the queue
		 * Updates current song index if needed
		 * @param {Object} state - Current state
		 * @param {Object} action - Action with song ID as payload
		 * @param {string} action.payload - Song identifier to remove
		 */
		removeSong: (state, action) => {
			if (!action.payload || typeof action.payload !== "string") return;
			const songIdx = state.queue.findIndex(
				(song) => song._id === action.payload
			);
			if (songIdx < 0) return;
			let temp = state.queue.slice(0, songIdx);
			if (songIdx < state.queue.length - 1)
				temp = temp.concat(state.queue.slice(songIdx + 1));
			state.queue = temp;
			if (temp.length === 0) state.currentSongIdx = -1;
			else if (state.currentSongIdx >= temp.length)
				state.currentSongIdx = temp.length - 1;
		},
	},
});

export const {
	setPlaylist,
	setCurrentSongIdx,
	nextSong,
	prevSong,
	addSongToQueue,
	toggleRepeat,
	playNext,
	removeSong,
} = configsSlice.actions;
export default configsSlice.reducer;

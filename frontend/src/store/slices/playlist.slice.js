import { createSlice } from "@reduxjs/toolkit";

export const configsSlice = createSlice({
	name: "playlist",
	initialState: {
		queue: [],
		currentSongIdx: -1,
	},
	reducers: {
		setPlaylist: (state, action) => {
			state.queue = action.payload;
			if (state.currentSongIdx === -1) state.currentSongIdx = 0;
		},
		addSongToQueue: (state, action) => {
			if (
				action.payload &&
				action.payload._id &&
				state.queue.filter((song) => song._id === action.payload._id)
					.length === 0
			)
				state.queue = [...state.queue, action.payload];
			if (state.currentSongIdx === -1) state.currentSongIdx = 0;
		},
		setCurrentSongIdx: (state, action) => {
			if (action.payload >= 0 && action.payload <= state.queue.length - 1)
				state.currentSongIdx = action.payload;
		},
		nextSong: (state) => {
			if (state.currentSongIdx < state.queue.length - 1)
				state.currentSongIdx++;
		},
		prevSong: (state) => {
			if (state.currentSongIdx !== 0) state.currentSongIdx--;
		},
	},
});

export const {
	setPlaylist,
	setCurrentSongIdx,
	nextSong,
	prevSong,
	addSongToQueue,
} = configsSlice.actions;
export default configsSlice.reducer;

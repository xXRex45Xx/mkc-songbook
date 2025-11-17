import { createSlice } from "@reduxjs/toolkit";

export const configsSlice = createSlice({
	name: "playlist",
	initialState: {
		queue: [],
		currentSongIdx: -1,
		repeat: "no-repeat",
	},
	reducers: {
		setPlaylist: (state, action) => {
			state.queue = action.payload;
			if (state.currentSongIdx === -1) state.currentSongIdx = 0;
		},
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
		setCurrentSongIdx: (state, action) => {
			if (action.payload >= 0 && action.payload <= state.queue.length - 1)
				state.currentSongIdx = action.payload;
		},
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
		nextSong: (state) => {
			if (state.currentSongIdx < state.queue.length - 1)
				state.currentSongIdx++;
		},
		prevSong: (state) => {
			if (state.currentSongIdx !== 0) state.currentSongIdx--;
		},
		toggleRepeat: (state) => {
			if (state.repeat === "no-repeat") state.repeat = "repeat-all";
			else if (state.repeat === "repeat-all")
				state.repeat = "repeat-current";
			else if (state.repeat === "repeat-current") state.repeat = "no-repeat";
		},
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

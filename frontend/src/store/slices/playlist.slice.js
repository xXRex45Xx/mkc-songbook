import { createSlice } from "@reduxjs/toolkit";

export const configsSlice = createSlice({
	name: "playlist",
	initialState: {
		playlist: [],
		currentSongIdx: -1,
	},
	reducers: {
		setPlaylist: (state, action) => {
			state.playlist = action.payload;
		},
		setCurrentSongIdx: (state, action) => {
			state.currentSongIdx = action.payload;
		},
		nextSong: (state) => {
			state.currentSongIdx++;
		},
		prevSong: (state) => {
			state.currentSongIdx--;
		},
	},
});

export const { setPlaylist, setCurrentSongIdx, nextSong, prevSong } =
	configsSlice.actions;
export default configsSlice.reducer;

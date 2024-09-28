import { createSlice } from "@reduxjs/toolkit";

export const configsSlice = createSlice({
    name: "configs",
    initialState: {
        lyricsFontSize: "15",
        windowWidth: window.innerWidth,
    },
    reducers: {
        setLyricsFontSize: (state, action) => {
            state.lyricsFontSize = action.payload;
        },
        setWindowInnerWidth: (state, action) => {
            state.windowWidth = action.payload;
        },
    },
});

export const { setLyricsFontSize, setWindowInnerWidth } = configsSlice.actions;
export default configsSlice.reducer;

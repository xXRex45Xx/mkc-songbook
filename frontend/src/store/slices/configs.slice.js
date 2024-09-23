import { createSlice } from "@reduxjs/toolkit";

export const configsSlice = createSlice({
    name: "configs",
    initialState: {
        lyricsFontSize: "15",
    },
    reducers: {
        setLyricsFontSize: (state, action) => {
            state.lyricsFontSize = action.payload;
        },
    },
});

export const { setLyricsFontSize } = configsSlice.actions;
export default configsSlice.reducer;

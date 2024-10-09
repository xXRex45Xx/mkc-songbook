import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        authEmail: "",
        authOtp: "",
        currentUser: null,
    },
    reducers: {
        setAuthEmail: (state, action) => {
            state.authEmail = action.payload;
        },
        setAuthOtp: (state, action) => {
            state.authOtp = action.payload;
        },
        resetAuth: (state, _action) => {
            state.authEmail = "";
            state.authOtp = "";
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
    },
});

export const { setAuthEmail, setAuthOtp, resetAuth, setCurrentUser } =
    userSlice.actions;
export default userSlice.reducer;
import { configureStore } from "@reduxjs/toolkit";
import configsReducer from "./slices/configs.slice";
import userReducer from "./slices/user.slice";

export default configureStore({
    reducer: { configs: configsReducer, user: userReducer },
});

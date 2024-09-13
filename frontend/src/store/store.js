import { configureStore } from "@reduxjs/toolkit";
import configsReducer from "./slices/configs.slice";

export default configureStore({
    reducer: { configs: configsReducer },
});

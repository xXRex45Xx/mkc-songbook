import mongoose from "mongoose";

export const connect = async (uri) => {
    try {
        await mongoose.connect(uri);
    } catch (err) {
        console.error(err);
        throw err;
    }
};

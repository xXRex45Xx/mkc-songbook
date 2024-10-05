import { Schema, model, Types } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    name: { type: String, required: true, trim: true },
    password: { type: String },
    searchHistory: [
        { type: Types.ObjectId, required: true, ref: "SearchHistory" },
    ],
    photo: { type: String },
    role: {
        type: String,
        enum: ["public", "member", "admin"],
        default: "public",
    },
});

const UserModel = model("User", userSchema);

export default UserModel;

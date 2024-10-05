import { Schema, model, Types } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
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

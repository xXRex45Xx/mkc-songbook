import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: { type: String, required: true, minLength: 8 },
    password: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
});

const UserModel = model("User", userSchema);

export default UserModel;

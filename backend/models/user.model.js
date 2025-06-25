/**
 * User model module.
 * Defines the schema and model for user data in the application.
 * Handles user authentication, profile management, and search history tracking.
 * @module models/user
 */

import { Schema, model, Types } from "mongoose";

/**
 * User schema definition.
 * @typedef {Object} UserSchema
 * @property {string} email - User's email address (unique, required, lowercase, validated with regex)
 * @property {string} name - User's full name (required, trimmed)
 * @property {string} [password] - User's hashed password (optional for OAuth users)
 * @property {Types.ObjectId[]} searchHistory - Array of references to user's search history entries
 * @property {string} [photo] - URL to user's profile photo
 * @property {('public'|'member'|'admin')} [role=public] - User's role in the system
 */
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
        enum: ["public", "member", "admin", "super-admin"],
        default: "public",
    },
});

const UserModel = model("User", userSchema);

export default UserModel;

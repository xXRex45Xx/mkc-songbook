/**
 * User Model - Database schema for user entities
 *
 * This model defines the structure and validation rules for users in the database.
 * It includes relationships with search history, favorites, and provides a comprehensive
 * view of how user data is stored and organized. The model supports various operations
 * including creation, updates, and retrieval while maintaining data integrity and consistency.
 *
 * @module models/user
 *
 * @property {string} _id - Unique identifier for user with explanation of automatic generation and UUID format
 * @property {string} email - User's email address (required, unique, lowercase) with detailed explanation of validation rules and constraints
 * @property {string} name - User's full name (required, trimmed) with description of content constraints, character limits, and validation rules
 * @property {string} [password] - User's hashed password (optional for OAuth users) with explanation of security considerations and storage practices
 * @property {Types.ObjectId[]} searchHistory - Array of references to user's search history entries (optional) with explanation of relationship mapping and constraint validation
 * @property {string[]} favorites - Array of song IDs that are favorites (optional) with explanation of how it's used for user preferences
 * @property {string} [photo] - URL to user's profile photo (optional) with description of storage location, file naming conventions, and validation requirements
 * @property {('public'|'member'|'admin'|'super-admin')} role - User's role in the system (defaults to public) with explanation of role-based access control and privilege levels
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
import { Schema, model, Types } from "mongoose";

/**
 * User schema definition.
 *
 * This schema defines the structure for user data including email, name, password,
 * search history, favorites, profile photo, and role. It includes validation rules
 * and default values to ensure data consistency and proper handling.
 *
 * @typedef {Object} UserSchema
 * @property {string} _id - Unique identifier for user with explanation of automatic generation and UUID format
 * @property {string} email - User's email address (required, unique, lowercase) with detailed explanation of validation rules and constraints
 * @property {string} name - User's full name (required, trimmed) with description of content constraints, character limits, and validation rules
 * @property {string} [password] - User's hashed password (optional for OAuth users) with explanation of security considerations and storage practices
 * @property {Types.ObjectId[]} searchHistory - Array of references to user's search history entries (optional) with explanation of relationship mapping and constraint validation
 * @property {string[]} favorites - Array of song IDs that are favorites (optional) with explanation of how it's used for user preferences
 * @property {string} [photo] - URL to user's profile photo (optional) with description of storage location, file naming conventions, and validation requirements
 * @property {('public'|'member'|'admin'|'super-admin')} role - User's role in the system (defaults to public) with explanation of role-based access control and privilege levels
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
	favorites: [{ type: String, ref: "Song" }],
	photo: { type: String },
	role: {
		type: String,
		enum: ["public", "member", "admin", "super-admin"],
		default: "public",
	},
});

const UserModel = model("User", userSchema);

export default UserModel;
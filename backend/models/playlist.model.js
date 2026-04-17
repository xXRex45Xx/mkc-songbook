/**
 * Playlist Model - Database schema for playlist entities
 *
 * This model defines the structure and validation rules for playlists in the database.
 * It includes relationships with creators and songs, visibility settings, and provides a comprehensive
 * view of how playlist data is stored and organized. The model supports various operations
 * including creation, updates, and retrieval while maintaining data integrity and consistency.
 *
 * @module models/playlist
 *
 * @property {string} _id - Unique identifier for playlist with explanation of automatic generation and UUID format
 * @property {string} name - Name of playlist (required, indexed for search, trimmed) with description of content constraints, character limits, and validation rules
 * @property {string} visibility - Visibility level of the playlist (defaults to private) with detailed explanation of available visibility options and their implications
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 * @property {Types.ObjectId} creator - Reference to user who created the playlist (required) with explanation of relationship mapping and constraint validation
 * @property {string[]} songs - Array of song IDs included in this playlist (optional) with explanation of relationship mapping and constraint validation
 */
import { model, Schema, Types } from "mongoose";

/**
 * Playlist schema definition.
 *
 * This schema defines the structure for playlist data including name, visibility,
 * creator reference, and associated songs. It includes validation rules and default values
 * to ensure proper data handling and consistency.
 *
 * @typedef {Object} PlaylistSchema
 * @property {string} _id - Unique identifier for playlist with explanation of automatic generation and UUID format
 * @property {string} name - Name of playlist (required, indexed for search, trimmed) with description of content constraints, character limits, and validation rules
 * @property {string} visibility - Visibility level of the playlist (defaults to private) with detailed explanation of available visibility options and their implications
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 * @property {Types.ObjectId} creator - Reference to user who created the playlist (required) with explanation of relationship mapping and constraint validation
 * @property {string[]} songs - Array of song IDs included in this playlist (optional) with explanation of relationship mapping and constraint validation
 */
const playlistSchema = new Schema({
	name: {
		type: String,
		trim: true,
		minLength: 1,
		required: true,
		index: true,
	},
	visibility: {
		type: String,
		enum: ["private", "members", "public"],
		default: "private",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	creator: { type: Types.ObjectId, required: true, index: true, ref: "User" },
	songs: [{ type: String, ref: "Song" }],
});

const PlaylistModel = model("Playlist", playlistSchema);

export default PlaylistModel;
/**
 * Album Model - Database schema for album entities
 *
 * This model defines the structure and validation rules for albums in the database.
 * It includes relationships with songs, cover images, and provides a comprehensive
 * view of how album data is stored and organized. The model supports various operations
 * including creation, updates, and retrieval while maintaining data integrity and consistency.
 *
 * @module models/album
 *
 * @property {string} _id - Unique identifier for album with explanation of automatic generation and UUID format
 * @property {string} name - Name of album (required, minimum length: 1) with description of content constraints, character limits, and validation rules
 * @property {string} createdAt - Year the album was created (defaults to current year, minimum length: 4) with detailed explanation of creation date handling
 * @property {string} [photoPath] - Path to album cover image (optional) with explanation of storage location and file naming conventions
 * @property {string} [photoLink] - URL to album cover image (optional) with description of how it's used for display purposes
 * @property {string[]} songs - References to song IDs (optional) with explanation of relationship mapping and constraint validation
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
import { Schema, model } from "mongoose";

/**
 * Album schema definition.
 *
 * This schema defines the structure for album data including name, creation date,
 * cover images, and associated songs. It includes validation rules and default values
 * to ensure data consistency and proper handling.
 *
 * @typedef {Object} AlbumSchema
 * @property {string} _id - Unique identifier for album (required) with explanation of generation method and validation rules
 * @property {string} name - Name of album (required, minimum length: 1) with description of content constraints, character limits, and validation rules
 * @property {string} createdAt - Year the album was created (defaults to current year, minimum length: 4) with detailed explanation of creation date handling
 * @property {string} [photoPath] - Path to album cover image (optional) with explanation of storage location and file naming conventions
 * @property {string} [photoLink] - URL to album cover image (optional) with description of how it's used for display purposes
 * @property {string[]} songs - References to song IDs (optional) with explanation of relationship mapping and constraint validation
 */
const albumSchema = new Schema({
	_id: { type: String, minLength: 1, required: true },
	name: { type: String, minLength: 1, required: true },
	createdAt: {
		type: String,
		default: () => new Date().getFullYear().toString(),
		minLength: 4,
		required: true,
	},
	photoPath: { type: String },
	photoLink: { type: String },
	songs: [{ type: String, ref: "Song" }],
});

const AlbumModel = model("Album", albumSchema);

export default AlbumModel;

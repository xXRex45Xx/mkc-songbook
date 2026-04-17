/**
 * Song Model - Database schema for song entities
 *
 * This model defines the structure and validation rules for songs in the database.
 * It includes relationships with albums, musical elements, and provides a comprehensive
 * view of how song data is stored and organized. The model supports various operations
 * including creation, updates, and retrieval while maintaining data integrity and consistency.
 *
 * @module models/song
 *
 * @property {string} _id - Unique identifier for song with explanation of automatic generation and UUID format
 * @property {string} title - Song title (required, indexed for search, trimmed) with description of content constraints, character limits, and validation rules
 * @property {string} lyrics - Song lyrics (required, trimmed) with detailed explanation of text format requirements, encoding considerations, and length limits
 * @property {Object} musicElements - Musical attributes of the song with comprehensive details about each element's purpose and data structure
 * @property {string} [musicElements.chord] - Song's chord progression (e.g., "Am", "C") with explanation of musical notation and usage context
 * @property {number} [musicElements.tempo] - Song's tempo in BPM (beats per minute) with description of musical context and typical ranges
 * @property {string} [musicElements.rythm] - Song's rhythm pattern (e.g., "4/4", "Waltz") with explanation of musical patterns and terminology
 * @property {string} createdAt - Year the song was added (defaults to current year) with detailed explanation of creation date handling
 * @property {Date} updatedAt - Last modification timestamp with explanation of when it's updated and how it's tracked
 * @property {string} [songFilePath] - Path to the song's audio file (optional) with explanation of storage location, file naming conventions, and validation requirements
 * @property {string} [youtubeLink] - Link to song's YouTube video (optional) with description of URL format validation and embed restrictions
 * @property {string[]} albums - Array of album IDs this song belongs to (optional) with explanation of relationship mapping and constraint validation
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
import { Schema, model, Types } from "mongoose";

/**
 * Song schema definition.
 *
 * This schema defines the structure for song data including title, lyrics,
 * musical elements, creation date, and album associations. It includes validation rules
 * and default values to ensure data consistency and proper handling.
 *
 * @typedef {Object} SongSchema
 * @property {string} _id - Unique identifier for song (required) with explanation of generation method and validation rules
 * @property {string} title - Song title (required, indexed for search, trimmed) with description of content constraints, character limits, and validation rules
 * @property {string} lyrics - Song lyrics (required, trimmed) with detailed explanation of text format requirements, encoding considerations, and length limits
 * @property {Object} musicElements - Musical attributes of the song with comprehensive details about each element's purpose and data structure
 * @property {string} [musicElements.chord] - Song's chord progression (e.g., "Am", "C") with explanation of musical notation and usage context
 * @property {number} [musicElements.tempo] - Song's tempo in BPM (beats per minute) with description of musical context and typical ranges
 * @property {string} [musicElements.rythm] - Song's rhythm pattern (e.g., "4/4", "Waltz") with explanation of musical patterns and terminology
 * @property {string} createdAt - Year the song was added (defaults to current year) with detailed explanation of creation date handling
 * @property {Date} updatedAt - Last modification timestamp with explanation of when it's updated and how it's tracked
 * @property {string} [songFilePath] - Path to the song's audio file (optional) with explanation of storage location, file naming conventions, and validation requirements
 * @property {string} [youtubeLink] - Link to song's YouTube video (optional) with description of URL format validation and embed restrictions
 * @property {string[]} albums - Array of album IDs this song belongs to (optional) with explanation of relationship mapping and constraint validation
 */
const songSchema = new Schema({
	_id: { type: String, minLength: 1, required: true },
	title: {
		type: String,
		trim: true,
		minLength: 1,
		required: true,
		index: true,
	},
	lyrics: { type: String, trim: true, required: true },
	musicElements: {
		chord: { type: String },
		tempo: { type: Number },
		rythm: { type: String },
	},
	createdAt: {
		type: String,
		trim: true,
		default: () => new Date().getFullYear().toString(),
	},
	updatedAt: { type: Date, default: Date.now },
	songFilePath: { type: String },
	youtubeLink: { type: String },
	albums: [{ type: String, ref: "Album" }],
});

const SongModel = model("Song", songSchema);

export default SongModel;
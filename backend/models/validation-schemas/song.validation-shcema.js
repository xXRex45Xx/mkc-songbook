/**
 * Song validation schemas module.
 * Defines Joi validation schemas for song-related operations.
 * @module validation-schemas/song
 */

import Joi from "joi";

/**
 * Schema for validating song list query parameters.
 *
 * This schema defines the structure for search query parameters including query string,
 * page number, search type, all flag, and sort order. It supports flexible search capabilities
 * for songs with pagination support.
 *
 * @typedef {Object} GetAllSongsQuery
 * @property {string} [q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {('all'|'title'|'lyrics'|'id')} [type] - Search type (optional) with description of available search modes and their behavior
 * @property {boolean} [all] - Whether to return all songs (optional) with explanation of when to use this option
 * @property {('A-Z'|'Number'|'Recently Added')} [sortBy] - Sort order (optional) with detailed explanation of sorting options and orderings
 * @note Either 'q' or 'all' must be present, but not both
 * @note If 'q' is present, 'type' must also be present
 */
export const getAllSongsQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	page: Joi.number().integer().min(1).optional(),
	type: Joi.string().allow("all", "title", "lyrics", "id").only().optional(),
	all: Joi.boolean().optional(),
	sortBy: Joi.string().valid("A-Z", "Number", "Recently Added").optional(),
})
	.oxor("q", "all")
	.and("q", "type")
	.required();

/**
 * Schema for validating song ID in URL parameters.
 *
 * This schema defines the validation for song IDs in URL parameters.
 *
 * @typedef {Object} GetSongParams
 * @property {string} id - Song ID (required) with explanation of generation method and validation rules
 */
export const getSongParamsSchema = Joi.object({
	id: Joi.string().min(1).required(),
}).required();

/**
 * Schema for validating new song creation request body.
 *
 * This schema defines the structure for song creation data including ID, title,
 * lyrics, musical elements, album associations, and YouTube video links. It includes
 * validation rules to ensure proper data format and consistency.
 *
 * @typedef {Object} CreateSongBody
 * @property {string} id - Unique song ID (required) with explanation of generation method and validation rules
 * @property {string} title - Song title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} lyrics - Song lyrics (required, 2-50000 characters) with detailed explanation of text format requirements, encoding considerations, and length limits
 * @property {string} [chord] - Song chord progression (optional, 1-10 characters) with explanation of musical notation and usage context
 * @property {number} [tempo] - Song tempo in BPM (optional, non-negative integer) with description of musical context and typical ranges
 * @property {string} [rythm] - Song rhythm pattern (optional, 2-50 characters) with explanation of musical patterns and terminology
 * @property {string} [albums] - Comma-separated album IDs (optional) with explanation of relationship mapping and constraint validation
 * @property {string} [video-link] - YouTube video URL (optional) with description of URL format validation and embed restrictions
 */
export const createSongBodyValidationSchema = Joi.object({
	id: Joi.string().required(),
	title: Joi.string().min(2).max(100).required(),
	lyrics: Joi.string().min(2).max(50000).required(),
	chord: Joi.string().allow("").min(1).max(10).optional(),
	tempo: Joi.number().integer().min(0).optional(),
	rythm: Joi.string().allow("").min(2).max(50).optional(),
	albums: Joi.string().allow("").optional(),
	"video-link": Joi.string()
		.uri()
		.regex(
			/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
		)
		.allow("")
		.optional(),
}).required();

/**
 * Schema for validating patch song request body.
 *
 * This schema defines the structure for updating specific song properties including
 * YouTube video links. It includes validation rules to ensure proper data format and consistency.
 *
 * @typedef {Object} PatchSongBody
 * @property {string} [video-link] - YouTube video URL (optional) with description of URL format validation and embed restrictions
 */
export const patchSongBodyValidationSchema = Joi.object({
	"video-link": Joi.string()
		.uri()
		.regex(
			/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
		)
		.allow("")
		.optional(),
}).required();
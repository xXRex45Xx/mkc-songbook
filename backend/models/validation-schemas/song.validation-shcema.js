/**
 * Song validation schemas module.
 * Defines Joi validation schemas for song-related operations.
 * @module validation-schemas/song
 */

import Joi from "joi";

/**
 * Schema for validating song list query parameters.
 * @constant {Joi.ObjectSchema}
 * @property {string} [q] - Search query (max 100 chars)
 * @property {number} [page] - Page number (min 1)
 * @property {('all'|'title'|'lyrics'|'id')} [type] - Search type
 * @property {boolean} [all] - Whether to return all songs
 * @property {('A-Z'|'Number'|'Recently Added')} [sortBy] - Sort order
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
 * @constant {Joi.ObjectSchema}
 * @property {string} id - Song ID (non-empty)
 */
export const getSongParamsSchema = Joi.object({
	id: Joi.string().min(1).required(),
}).required();

/**
 * Schema for validating new song creation request body.
 * @constant {Joi.ObjectSchema}
 * @property {string} id - Unique song ID
 * @property {string} title - Song title (2-100 chars)
 * @property {string} lyrics - Song lyrics (2-50000 chars)
 * @property {string} [chord] - Song chord (1-10 chars)
 * @property {number} [tempo] - Song tempo (non-negative integer)
 * @property {string} [rythm] - Song rhythm (2-50 chars)
 * @property {string} [albums] - Comma-separated album IDs
 * @property {string} [video-link] - YouTube video URL
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

export const patchSongBodyValidationSchema = Joi.object({
	"video-link": Joi.string()
		.uri()
		.regex(
			/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
		)
		.allow("")
		.optional(),
});

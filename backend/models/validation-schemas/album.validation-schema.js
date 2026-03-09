/**
 * Album validation schemas module.
 * Defines Joi validation schemas for album-related operations.
 * @module validation-schemas/album
 */

import Joi from "joi";

/**
 * Schema for validating new album creation request body.
 *
 * This schema defines the structure for album creation data including ID, title,
 * YouTube playlist link, and song IDs. It includes validation rules to ensure
 * proper data format and consistency.
 *
 * @typedef {Object} CreateAlbumBody
 * @property {string} id - Unique album ID (required) with explanation of generation method and validation rules
 * @property {string} title - Album title (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} [playlistLink] - YouTube playlist URL (optional) with explanation of URL format validation and embed restrictions
 * @property {string[]} songs - Array of song IDs to include in the album (required) with explanation of relationship mapping and constraint validation
 */
export const createAlbumBodyValidationSchema = Joi.object({
	id: Joi.string().min(1).required(),
	title: Joi.string().min(2).max(100).required(),
	playlistLink: Joi.string()
		.uri()
		.regex(
			/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
		)
		.allow("")
		.optional(),
	songs: Joi.array().items(Joi.string().min(1)).min(1).required(),
	createdAt: Joi.string().min(1).optional(),
}).required();

/**
 * Schema for validating album ID parameter.
 *
 * This schema defines the validation for album IDs in URL parameters.
 *
 * @typedef {Object} GetAlbumParams
 * @property {string} id - Album ID (required) with explanation of generation method and validation rules
 */
export const getAlbumParamsSchema = Joi.object({
	id: Joi.string().min(1).required(),
}).required();

/**
 * Schema for validating album search query parameters.
 *
 * This schema defines the structure for album search parameters including query string,
 * names flag, etc. It supports flexible search capabilities for albums.
 *
 * @typedef {Object} GetAllAlbumsQuery
 * @property {string} [q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {boolean} [names] - Whether to return names only (optional) with explanation of use case
 */
export const getAllAlbumsQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	names: Joi.bool().optional(),
}).required();

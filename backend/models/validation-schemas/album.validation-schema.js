/**
 * Album validation schemas module.
 * Defines Joi validation schemas for album-related operations.
 * @module validation-schemas/album
 */

import Joi from "joi";

/**
 * Schema for validating new album creation request body.
 * @constant {Joi.ObjectSchema}
 * @property {string} id - Unique album ID (non-empty)
 * @property {string} title - Album title (2-100 chars)
 * @property {string} [playlistLink] - YouTube playlist URL
 * @property {string[]} songs - Array of song IDs to include in the album
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

export const getAlbumParamsSchema = Joi.object({
	id: Joi.string().min(1).required(),
}).required();

export const getAllAlbumsQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	names: Joi.bool().optional(),
}).required();

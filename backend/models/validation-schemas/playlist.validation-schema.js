import Joi from "joi";

/**
 * Schema for validating playlist search query parameters.
 *
 * This schema defines the structure for playlist search parameters including query string,
 * page number, and myPlaylists flag. It supports flexible search capabilities for playlists.
 *
 * @typedef {Object} GetAllPlaylistsQuery
 * @property {string} [q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {boolean} [myPlaylists] - Whether to return only user's playlists (optional) with explanation of use case
 */
export const getAllPlaylistsQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	page: Joi.number().integer().min(1).optional(),
	myPlaylists: Joi.bool().optional(),
}).required();

/**
 * Schema for validating create playlist request body.
 *
 * This schema defines the structure for playlist creation data including name, visibility,
 * and song IDs. It includes validation rules to ensure proper data format and consistency.
 *
 * @typedef {Object} CreatePlaylistBody
 * @property {string} name - Playlist name (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} [visibility] - Visibility level (optional) with explanation of available visibility options and their implications
 * @property {string[]} songs - Array of song IDs to include in the playlist (required) with explanation of relationship mapping and constraint validation
 */
export const createPlaylistBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	visibility: Joi.string().valid("private", "members", "public").optional(),
	songs: Joi.array().items(Joi.string().min(1)).required(),
}).required();

/**
 * Schema for validating update playlist request body.
 *
 * This schema defines the structure for playlist update data including name, visibility,
 * and song IDs. It includes validation rules to ensure proper data format and consistency.
 *
 * @typedef {Object} UpdatePlaylistBody
 * @property {string} name - Playlist name (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {string} visibility - Visibility level (required) with explanation of available visibility options and their implications
 * @property {string[]} songs - Array of song IDs to include in the playlist (required) with explanation of relationship mapping and constraint validation
 */
export const updatePlaylistBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	visibility: Joi.string().valid("private", "members", "public").required(),
	songs: Joi.array().items(Joi.string().min(1)).min(1).required(),
}).required();

/**
 * Schema for validating patch playlist request body.
 *
 * This schema defines the structure for playlist patch data including visibility, 
 * add songs and remove songs. It includes validation rules to ensure proper data format.
 *
 * @typedef {Object} PatchPlaylistBody
 * @property {string} [visibility] - Visibility level (optional) with explanation of available visibility options and their implications
 * @property {string[]} [addSongs] - Array of songs to add to playlist (optional) with explanation of how it's used for playlist management
 * @property {string[]} [removeSongs] - Array of songs to remove from playlist (optional) with explanation of how it's used for playlist management
 */
export const patchPlaylistBodySchema = Joi.object({
	visibility: Joi.string().valid("private", "members", "public").optional(),
	addSongs: Joi.array().items(Joi.string().min(1)).optional(),
	removeSongs: Joi.array().items(Joi.string().min(1)).optional(),
})
	.or("visibility", "addSongs", "removeSongs")
	.required();

/**
 * Schema for validating playlist ID parameter.
 *
 * This schema defines the validation for playlist IDs in URL parameters.
 *
 * @typedef {Object} GetPlaylistParams
 * @property {string} id - Playlist ID (required) with explanation of generation method and validation rules
 */
export const getPlaylistParamsSchema = Joi.object({
	id: Joi.string().min(1).required(),
}).required();

import Joi from "joi";

/**
 * Schema for validating service logbook search query parameters.
 *
 * This schema defines the structure for service logbook search parameters including query string,
 * page number, and type. It supports flexible search capabilities for logbooks.
 *
 * @typedef {Object} GetAllLogbookQuery
 * @property {string} [q] - Search query (optional, max 100 characters) with explanation of search scope and matching rules
 * @property {number} [page] - Page number for pagination (optional, min 1) with explanation of how pages are calculated and limits
 * @property {('location'|'date')} [type] - Search type (optional) with description of available search modes and their behavior
 * @note If 'q' is present, 'type' must also be present
 */
export const getAllLogbookQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	page: Joi.number().integer().min(1).optional(),
	type: Joi.string().allow("location", "date").optional(),
})
	.and("q", "type")
	.required();

/**
 * Schema for validating create logbook entry request body.
 *
 * This schema defines the structure for service logbook creation data including location,
 * timestamp, and song IDs. It includes validation rules to ensure proper data format and consistency.
 *
 * @typedef {Object} CreateLogBookBody
 * @property {string} location - Church location (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @property {Date} timestamp - Service date and time (required) with explanation of date format and timezone considerations
 * @property {string[]} songs - Array of song IDs used in the service (required) with explanation of relationship mapping and constraint validation
 */
export const createLogBookBodySchema = Joi.object({
	location: Joi.string().min(2).max(100).required(),
	timestamp: Joi.date().min("now").required(),
	songs: Joi.array().items(Joi.string().min(1)).min(1).required(),
}).required();

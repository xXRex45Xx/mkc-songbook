import {
	createLogBookBodySchema,
	getAllLogbookQuerySchema,
} from "../models/validation-schemas/service-logbook.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

/**
 * Validates query parameters for getting all log books.
 *
 * This middleware validates query parameters for log book listing requests against
 * the defined validation schema. It ensures that search queries and pagination parameters
 * meet the specified criteria before proceeding with log book retrieval.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates query parameters with proper schema checking explaining the complete validation process flow
 */
export const validateGetAllLogBooks = async (req, _res, next) => {
	await validateSchema(req.query, getAllLogbookQuerySchema);
	next();
};

/**
 * Validates the request body for creating a new log book entry.
 *
 * This middleware validates the request body for log book creation requests against
 * the defined validation schema. It ensures that all required fields are present and meet criteria.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} res - Express response object for sending responses back to client
 * @param {Function} next - Express next middleware function for continuing the request flow
 * @returns {Promise<void>} Validates log book creation body with proper schema checking explaining the complete validation process flow
 */
export const validateCreateLogBook = async (req, _res, next) => {
	await validateSchema(req.body, createLogBookBodySchema);
	next();
};


import {
	createLogBookBodySchema,
	getAllLogbookQuerySchema,
} from "../models/validation-schemas/service-logbook.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

export const validateGetAllLogBooks = async (req, _res, next) => {
	await validateSchema(req.query, getAllLogbookQuerySchema);
	next();
};

export const validateCreateLogBook = async (req, _res, next) => {
	await validateSchema(req.body, createLogBookBodySchema);
	next();
};

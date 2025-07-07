import Joi from "joi";

export const getAllLogbookQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	page: Joi.number().integer().min(1).optional(),
	type: Joi.string().allow("location", "date").optional(),
})
	.and("q", "type")
	.required();

export const createLogBookBodySchema = Joi.object({
	location: Joi.string().min(2).max(100).required(),
	timestamp: Joi.date().min("now").required(),
	songs: Joi.array().items(Joi.string().min(1)).min(1).required(),
}).required();

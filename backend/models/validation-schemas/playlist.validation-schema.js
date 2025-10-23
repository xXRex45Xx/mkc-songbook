import Joi from "joi";

export const getAllPlaylistsQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
	page: Joi.number().integer().min(1).optional(),
}).required();

export const createPlaylistBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	visibility: Joi.string().valid("private", "members", "public").optional(),
	songs: Joi.array().items(Joi.string().min(1)).required(),
}).required();

export const updatePlaylistBodySchema = Joi.object({
	name: Joi.string().min(2).max(100).required(),
	visibility: Joi.string().valid("private", "members", "public").required(),
	songs: Joi.array().items(Joi.string().min(1)).min(1).required(),
}).required();

export const getPlaylistParamsSchema = Joi.object({
	id: Joi.string().min(1).required(),
}).required();

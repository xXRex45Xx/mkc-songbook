import Joi from "joi";
export const getAllAlbumQuerySchema = Joi.object({
	q: Joi.string().max(100).optional(),
}).required();

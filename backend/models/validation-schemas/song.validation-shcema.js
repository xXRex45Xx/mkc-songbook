import Joi from "joi";

export const getAllSongsQuerySchema = Joi.object({
    q: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).optional(),
    type: Joi.string().allow("all", "title", "lyrics", "id").only().optional(),
    all: Joi.boolean().optional(),
})
    .oxor("q", "all")
    .and("q", "type")
    .required();

export const getSongParamsSchema = Joi.object({
    id: Joi.number().integer().min(1).required(),
}).required();

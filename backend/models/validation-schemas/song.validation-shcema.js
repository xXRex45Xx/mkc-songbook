import Joi from "joi";

export const getAllSongsQuerySchema = Joi.object({
    q: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).optional(),
    type: Joi.string().allow("all", "title", "lyrics", "id").only().optional(),
    all: Joi.boolean().optional(),
    sortBy: Joi.string().valid("A-Z", "Number", "Recently Added").optional(),
})
    .oxor("q", "all")
    .and("q", "type")
    .required();

export const getSongParamsSchema = Joi.object({
    id: Joi.number().integer().min(1).required(),
}).required();

export const createSongBodyValidationSchema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    title: Joi.string().min(2).max(100).required(),
    lyrics: Joi.string().min(2).max(50000).required(),
    chord: Joi.string().allow("").min(1).max(10).optional(),
    tempo: Joi.number().integer().min(0).optional(),
    rythm: Joi.string().allow("").min(2).max(50).optional(),
    album: Joi.string().allow("").optional(),
    "video-link": Joi.string()
        .uri()
        .regex(
            /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
        )
        .allow("")
        .optional(),
}).required();

import Joi from "joi";

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
    songs: Joi.array().items(Joi.string().min(1)).required(),
}).required();

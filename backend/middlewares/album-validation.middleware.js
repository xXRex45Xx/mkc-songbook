import { createAlbumBodyValidationSchema } from "../models/validation-schemas/album.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

export const validateCreateAlbum = async (req, _res, next) => {
    if (typeof req.body.songs === "string") req.body.songs = [req.body.songs];
    await validateSchema(req.body, createAlbumBodyValidationSchema);
    next();
};

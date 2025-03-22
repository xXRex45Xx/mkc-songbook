import { createAlbumBodyValidationSchema } from "../models/validation-schemas/album.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

export const validateCreateAlbum = async (req, _res, next) => {
    await validateSchema(req.body, createAlbumBodyValidationSchema);
    next();
};

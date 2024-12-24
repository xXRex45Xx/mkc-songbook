import {
    createSongBodyValidationSchema,
    getAllSongsQuerySchema,
    getSongParamsSchema,
} from "../models/validation-schemas/song.validation-shcema.js";
import { ClientFaultError } from "../utils/error.util.js";
import validateSchema from "../utils/validator.util.js";

export const validateGetAllSongs = async (req, _res, next) => {
    await validateSchema(req.query, getAllSongsQuerySchema);
    next();
};

export const validateGetSong = async (req, _res, next) => {
    await validateSchema(req.params, getSongParamsSchema);
    next();
};

export const validateCreateSong = async (req, _res, next) => {
    await validateSchema(req.body, createSongBodyValidationSchema);
    next();
};

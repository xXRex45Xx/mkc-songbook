import { getAllAlbumQuerySchema } from "../models/validation-schemas/album.validation-shcema.js";

import validateSchema from "../utils/validator.util.js";

export const validateGetAllAlbums = async (req, _res, next) => {
	await validateSchema(req.query, getAllAlbumQuerySchema);
	next();
};

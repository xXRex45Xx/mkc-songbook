import {
	getAllPlaylistsQuerySchema,
	createPlaylistBodySchema,
	updatePlaylistBodySchema,
	getPlaylistParamsSchema,
} from "../models/validation-schemas/playlist.validation-schema.js";
import validateSchema from "../utils/validator.util.js";

export const validateCreatePlaylist = async (req, res, next) => {
	if (typeof req.body.songs === "string") req.body.songs = [req.body.songs];
	await validateSchema(req.body, createPlaylistBodySchema);
	next();
};

export const validateUpdatePlaylist = async (req, res, next) => {
	await validateSchema(req.body, updatePlaylistBodySchema);
	next();
};

export const validateGetAllPlaylists = async (req, res, next) => {
	await validateSchema(req.query, getAllPlaylistsQuerySchema);
	next();
};

export const validateGetPlaylist = async (req, res, next) => {
	await validateSchema(req.params, getPlaylistParamsSchema);
	next();
};

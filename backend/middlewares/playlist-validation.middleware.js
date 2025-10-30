import PlaylistModel from "../models/playlist.model.js";
import SongModel from "../models/song.model.js";
import {
	getAllPlaylistsQuerySchema,
	createPlaylistBodySchema,
	updatePlaylistBodySchema,
	getPlaylistParamsSchema,
	patchPlaylistBodySchema,
} from "../models/validation-schemas/playlist.validation-schema.js";
import { ClientFaultError, NotFoundError } from "../utils/error.util.js";
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

export const validatePatchPlaylist = async (req, _res, next) => {
	await validateSchema(req.body, patchPlaylistBodySchema);

	const { id } = req.params;
	const { addSongs } = req.body;

	const playlist = await PlaylistModel.findById(id);
	if (!playlist) throw new NotFoundError("Playlist not found.");
	if (playlist.creator.toString() !== req.user._id.toString())
		throw new ForbiddenError(
			"You are not authorized to update this playlist"
		);
	req.playlist = playlist;

	if (!addSongs || addSongs.length === 0) return next();

	if (addSongs && addSongs.length > 0) {
		addSongs.forEach((song) => {
			if (playlist.songs.includes(song))
				throw new ClientFaultError(
					"One or more songs are already in the playlist."
				);
		});
		const songsInDb = await SongModel.find({ _id: { $in: addSongs } });
		if (songsInDb.length !== addSongs.length)
			throw new ClientFaultError("One or more songs don't exist.");
	}
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

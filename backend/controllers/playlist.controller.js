import PlaylistModel from "../models/playlist.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import {
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
} from "../utils/error.util.js";

export const getAllOrSearchPlaylists = async (req, res) => {
	const { q, page = 1 } = req.query;
	const isMemberOrAdmin =
		req.user && ["member", "admin", "super-admin"].includes(req.user.role);
	let regex,
		selection = req.user
			? {
					$or: [
						{ visibility: "public" },
						{ visibility: "private", user: req.user._id },
					],
			  }
			: { visibility: "public" };
	if (isMemberOrAdmin)
		selection = {
			$or: [
				{ visibility: { $in: ["members", "public"] } },
				{ visibility: "private", user: req.user._id },
			],
		};
	if (q) {
		regex = new RegExp(regexBuilder(q), "i");
		selection.name = { $regex: regex };
	}

	const playlists = await PlaylistModel.find(selection, "name songs")
		.skip((page - 1) * 30)
		.limit(30);
	const totalDocuments = await PlaylistModel.find(selection).countDocuments();
	totalPages = Math.floor(totalDocuments / 30) + 1;

	res.status(200).json({ playlists, totalPages });
};

export const createPlaylist = async (req, res) => {
	const playlist = req.body;

	const insertedPlaylist = await PlaylistModel.create({
		name: playlist.name,
		songs: playlist.songs,
		creator: req.user._id,
	});

	res.status(201).json({ insertedId: insertedPlaylist._id });
};

export const getPlaylist = async (req, res) => {
	const { id } = req.params;
	const playlist = await PlaylistModel.findById(id).populate({
		path: "songs",
		select: "title",
		populate: { path: "albums", select: "name" },
	});

	if (!playlist) throw new NotFoundError("Playlist not found");

	if (!req.user && playlist.visibility !== "public")
		throw new ForbiddenError();
	if (
		req.user &&
		playlist.visibility === "private" &&
		req.user._id !== playlist.creator
	)
		throw new ForbiddenError();
	if (
		req.user &&
		req.user.role === "public" &&
		playlist.visibility === "members"
	)
		throw new ForbiddenError();

	res.status(200).json(playlist);
};

export const updatePlaylist = async (req, res) => {
	const { id } = req.params;
	const playlist = req.body;

	const playlistInDb = await PlaylistModel.findById(id);
	if (!playlistInDb) throw new NotFoundError("Playlist not found");
	if (playlistInDb.creator !== req.user._id) throw new ForbiddenError();

	playlistInDb.name = playlist.name;
	playlistInDb.visibility = playlist.visibility;
	playlistInDb.songs = playlist.songs;
	playlistInDb.updatedAt = Date.now();

	await playlistInDb.save();
	res.status(200).json({ updated: true });
};

export const deletePlaylist = async (req, res) => {
	const { id } = req.params;
	const playlist = await PlaylistModel.findById(id);

	if (!playlist) throw new NotFoundError("Playlist not found");
	if (playlist.creator !== req.user._id) throw new ForbiddenError();

	await PlaylistModel.findByIdAndDelete(id);

	res.status(200).json({ deleted: true });
};

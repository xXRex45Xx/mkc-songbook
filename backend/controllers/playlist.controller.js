import PlaylistModel from "../models/playlist.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";

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

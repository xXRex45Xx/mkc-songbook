import AlbumModel from "../models/album.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";

export const getAllOrSearchAlbum = async (req, res) => {
	const { q } = req.query;
	let albums;
	if (q) {
		const regex = new RegExp(regexBuilder(q), "i");
		albums = await AlbumModel.find(
			{ name: regex },
			{ name: true, photo: true, year: true }
		).populate("songs", "_id");
	} else {
		albums = await AlbumModel.find(
			{},
			{ name: true, photo: true, year: true }
		);
	}
	res.status(200).json({ albums });
};

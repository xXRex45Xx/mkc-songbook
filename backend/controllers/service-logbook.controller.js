import LogBookModel from "../models/service-logbook.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";

export const getAllOrSearchLogBook = async (req, res) => {
	const { q, page = 1, type } = req.query;
	let queryPromises;

	if (q) {
		let query = {};

		if (type === "location")
			query = { churchName: { $regex: new RegExp(regexBuilder(q), "i") } };
		else if (type === "date") query = { serviceDate: q };

		queryPromises = [
			LogBookModel.find(query, {
				songList: false,
			})
				.skip((page - 1) * 100)
				.limit(100),
			LogBookModel.find(query).countDocuments(),
		];
	} else {
		queryPromises = [
			LogBookModel.find(
				{},
				{
					songList: false,
				}
			)
				.skip((page - 1) * 100)
				.limit(100),
			LogBookModel.find({}).countDocuments(),
		];
	}
	const [logBookFromDb, totalDocuments] = await Promise.all(queryPromises);
	const totalPages = Math.floor(totalDocuments / 100) + 1;

	res.status(200).json({ logBook: logBookFromDb, totalPages });
};

export const addLog = async (req, res) => {
	const log = req.body;
	const inseretedLog = await LogBookModel.create({
		churchName: log.location,
		serviceDate: log.timestamp,
		songList: log.songs,
	});

	res.status(201).json({ inseretedLog: inseretedLog._id });
};

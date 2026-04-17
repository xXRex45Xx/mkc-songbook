import LogBookModel from "../models/service-logbook.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";

/**
 * Get all log entries or search log entries with pagination
 *
 * This function retrieves log entries from the database based on specified criteria.
 * It supports searching by location or date with pagination support.
 * The function handles various search types to provide flexible access to log data.
 *
 * @param {Object} req - Express request object containing query parameters
 * @param {Object} req.query - Query parameters with detailed explanation of each option
 * @param {string} [req.query.q] - Search query (location, date) with description of search scope and matching rules
 * @param {number} [req.query.page=1] - Page number for pagination with explanation of how pages are calculated and limits
 * @param {string} [req.query.type] - Search type (location/date) with description of available search modes and their behavior
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with log entries and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no log entries match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 */
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

/**
 * Add a new log entry
 *
 * This function creates a new log entry in the database with provided data.
 * It validates the input parameters and stores the entity in the database.
 * The function returns information about the created entity for confirmation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Log data to create with detailed explanation of each field
 * @param {string} req.body.location - Church name or location with description of content constraints, character limits, and validation rules
 * @param {string} req.body.timestamp - Service date with explanation of format requirements and validation rules
 * @param {Array} [req.body.songs] - Array of song IDs (optional) with explanation of relationships and constraints
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted log ID explaining the complete process flow
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 */
export const addLog = async (req, res) => {
	const log = req.body;
	const inseretedLog = await LogBookModel.create({
		churchName: log.location,
		serviceDate: log.timestamp,
		songList: log.songs,
	});

	res.status(201).json({ inseretedLog: inseretedLog._id });
};
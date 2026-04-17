import PlaylistModel from "../models/playlist.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import { ForbiddenError, NotFoundError } from "../utils/error.util.js";

/**
 * Get all playlists or search playlists with pagination
 *
 * This function retrieves playlists from the database based on specified criteria.
 * It supports searching by playlist name and provides access control based on user roles.
 * The function handles various visibility settings to ensure appropriate access to playlists.
 *
 * @param {Object} req - Express request object containing query parameters
 * @param {Object} req.query - Query parameters with detailed explanation of each option
 * @param {string} [req.query.q] - Search query (playlist name) with description of search scope and matching rules
 * @param {number} [req.query.page=1] - Page number for pagination with explanation of how pages are calculated and limits
 * @param {boolean} [req.query.myPlaylists] - Whether to return only user's playlists with explanation of when to use this option
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with playlists and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no playlists match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 */
export const getAllOrSearchPlaylists = async (req, res) => {
	const { q, page = 1, myPlaylists } = req.query;

	if (myPlaylists) {
		if (!req.user) throw new ForbiddenError("You need to login first.");
		const playlists = await PlaylistModel.find(
			{ creator: req.user._id },
			"name songs"
		);
		return res.status(200).json(
			playlists.map((playlist) => ({
				...playlist._doc,
				numOfSongs: playlist.songs.length,
				songs: undefined,
			}))
		);
	}

	const isMemberOrAdmin =
		req.user && ["member", "admin", "super-admin"].includes(req.user.role);
	let regex,
		selection = req.user
			? {
					$or: [
						{ visibility: "public" },
						{ visibility: "private", creator: req.user._id },
					],
			  }
			: { visibility: "public" };
	if (isMemberOrAdmin)
		selection = {
			$or: [
				{ visibility: { $in: ["members", "public"] } },
				{ visibility: "private", creator: req.user._id },
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
	const totalPages = Math.floor(totalDocuments / 30) + 1;

	res.status(200).json({
		playlists: playlists.map((playlist) => ({
			...playlist._doc,
			numOfSongs: playlist.songs.length,
			songs: undefined,
		})),
		totalPages,
	});
};

/**
 * Create a new playlist
 *
 * This function creates a new playlist in the database with provided data.
 * It validates the input parameters, checks for visibility settings,
 * and stores the entity in the database. The function returns information about
 * the created entity for confirmation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Playlist data to create with detailed explanation of each field
 * @param {string} req.body.name - Name of playlist with description of content constraints, character limits, and validation rules
 * @param {Array} [req.body.songs] - Array of song IDs (optional) with explanation of relationships and constraints
 * @param {string} [req.body.visibility] - Visibility setting ("public", "private", "members") (optional) with description of available options and their access control
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted playlist ID explaining the complete process flow
 * @throws {ForbiddenError} If user is not authorized to create playlist with explanation of authorization requirements
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 */
export const createPlaylist = async (req, res) => {
	const playlist = req.body;

	if (playlist.visibility === "members" && req.user.role === "public")
		throw new ForbiddenError(
			"You have to be a choir member to create members only playlist."
		);

	const insertedPlaylist = await PlaylistModel.create({
		name: playlist.name,
		songs: playlist.songs,
		visibility: playlist.visibility ? playlist.visibility : "private",
		creator: req.user._id,
	});

	res.status(201).json({ insertedId: insertedPlaylist._id });
};

/**
 * Get a single playlist by ID
 *
 * This function retrieves a single playlist from the database by its ID.
 * It handles access control based on visibility settings and user permissions.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Playlist ID with explanation of how it's used to find the playlist
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with playlist data explaining the complete structure and content
 * @throws {NotFoundError} If playlist is not found with specific explanation of why no playlist was found
 */
export const getPlaylist = async (req, res) => {
	const { id } = req.params;
	const playlist = await PlaylistModel.findById(id)
		.populate({
			path: "songs",
			select: "title songFilePath",
			populate: { path: "albums", select: "name" },
		})
		.populate("creator", "name");

	if (!playlist) throw new NotFoundError("Playlist not found");

	if (!req.user && playlist.visibility !== "public")
		throw new NotFoundError("Playlist not found");

	if (
		req.user &&
		playlist.visibility === "private" &&
		req.user._id.toString() !== playlist.creator._id.toString()
	)
		throw new NotFoundError("Playlist not found");

	if (
		req.user &&
		req.user.role === "public" &&
		playlist.visibility === "members"
	)
		throw new NotFoundError("Playlist not found");

	res.status(200).json({
		...playlist._doc,
		songs: playlist.songs.map((song) => ({
			...song._doc,
			hasAudio: song.songFilePath ? true : false,
			songFilePath: undefined,
		})),
	});
};

/**
 * Update an existing playlist
 *
 * This function updates an existing playlist in the database with provided data.
 * It validates user authorization and checks for changes to playlist properties.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Playlist ID with explanation of how it's used to find the playlist
 * @param {Object} req.body - Updated playlist data with detailed explanation of each field
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow
 * @throws {NotFoundError} If playlist is not found with specific explanation of why no playlist was found
 * @throws {ForbiddenError} If user is not authorized to update playlist with explanation of authorization requirements
 */
export const updatePlaylist = async (req, res) => {
	const { id } = req.params;
	const playlist = req.body;

	const playlistInDb = await PlaylistModel.findById(id);
	if (!playlistInDb) throw new NotFoundError("Playlist not found");
	if (playlistInDb.creator.toString() !== req.user._id.toString())
		throw new ForbiddenError(
			"You are not authorized to update this playlist"
		);

	playlistInDb.name = playlist.name;
	playlistInDb.visibility = playlist.visibility;
	playlistInDb.songs = playlist.songs;
	playlistInDb.updatedAt = Date.now();

	await playlistInDb.save();
	res.status(200).json({ updated: true });
};

/**
 * Partially update a playlist's properties
 *
 * This function partially updates a playlist's properties in the database.
 * It handles specific fields like visibility and song additions/removals.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Updated playlist data with detailed explanation of each field
 * @param {string} [req.body.visibility] - New visibility setting (optional) with description of available options and their access control
 * @param {Array} [req.body.addSongs] - Songs to add to playlist (optional) with explanation of how it's used to append songs
 * @param {Array} [req.body.removeSongs] - Songs to remove from playlist (optional) with explanation of how it's used to delete songs
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow
 */
export const patchPlaylist = async (req, res) => {
	const { visibility, addSongs, removeSongs } = req.body;

	const playlistInDb = req.playlist;

	if (visibility) playlistInDb.visibility = visibility;
	if (addSongs) playlistInDb.songs = playlistInDb.songs.concat(addSongs);
	if (removeSongs)
		playlistInDb.songs = playlistInDb.songs.filter(
			(songInDb) => !removeSongs.includes(songInDb)
		);

	await playlistInDb.save();
	res.status(200).json({ updated: true });
};

/**
 * Delete a playlist
 *
 * This function deletes a playlist from the database.
 * It validates user authorization before deletion.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Playlist ID with explanation of how it's used to find the playlist
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with deletion status explaining the complete process flow
 * @throws {NotFoundError} If playlist is not found with specific explanation of why no playlist was found
 * @throws {ForbiddenError} If user is not authorized to delete playlist with explanation of authorization requirements
 */
export const deletePlaylist = async (req, res) => {
	const { id } = req.params;
	const playlist = await PlaylistModel.findById(id);

	if (!playlist) throw new NotFoundError("Playlist not found");
	if (playlist.creator.toString() !== req.user._id.toString())
		throw new ForbiddenError(
			"You are not authorized to delete this playlist"
		);

	await PlaylistModel.findByIdAndDelete(id);

	res.status(200).json({ deleted: true });
};
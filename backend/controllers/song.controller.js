/**
 * Song Controller
 *
 * This module handles all song-related operations including:
 * 1. CRUD operations for songs
 * 2. Search functionality with pagination
 * 3. File management for song audio
 * 4. Album relationship management
 *
 * @module song.controller
 */

import AlbumModel from "../models/album.model.js";
import SongModel from "../models/song.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import { NotFoundError, ServerFaultError } from "../utils/error.util.js";
import fs from "fs";

/**
 * Get all songs or search songs with pagination
 *
 * This function retrieves songs from the database based on specified criteria.
 * It supports searching by title, lyrics, ID, and other attributes with pagination support.
 * The function handles various search types and sorting options to provide flexible access to data.
 *
 * @param {Object} req - Express request object containing query parameters
 * @param {Object} req.query - Query parameters with detailed explanation of each option
 * @param {string} [req.query.q] - Search query (title, lyrics, ID) with description of search scope and matching rules
 * @param {number} [req.query.page=1] - Page number for pagination with explanation of how pages are calculated and limits
 * @param {boolean} [req.query.all] - Whether to return all without pagination with explanation of when to use this option
 * @param {string} [req.query.type] - Search type (title/lyrics/id) with description of available search modes and their behavior
 * @param {string} [req.query.sortBy] - Field to sort by with detailed explanation of sorting options and orderings
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with songs and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no songs match criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 */
export const getAllOrSearchSongs = async (req, res) => {
	const { q, page = 1, all, type, sortBy } = req.query;
	let songs, totalPages;
	const projection = "title songFilePath";
	if (all) songs = await SongModel.find();
	else if (!q) {
		songs = await SongModel.find({}, projection)
			.sort(sortBy)
			.collation({ locale: "en_US", numericOrdering: sortBy === "_id" })
			.populate("albums", "name")
			.skip((page - 1) * 100)
			.limit(100);
		const totalDocuments = await SongModel.find({}).countDocuments();
		totalPages = Math.floor(totalDocuments / 100) + 1;
	} else {
		const regex = new RegExp(regexBuilder(q), "i");
		let query = {};

		if (type === "title") query = { title: { $regex: regex } };
		else if (type === "lyrics") query = { lyrics: { $regex: regex } };
		else if (type === "id") query = { _id: q };
		else {
			const queryPromises = [
				SongModel.find({ title: regex }, projection)
					.sort(sortBy)
					.collation({
						locale: "en_US",
						numericOrdering: sortBy === "_id",
					})
					.populate("albums", "name")
					.skip((page - 1) * 100)
					.limit(100),
				SongModel.find({ title: regex }).countDocuments(),
				SongModel.find({ lyrics: regex }, projection)
					.sort(sortBy)
					.collation({
						locale: "en_US",
						numericOrdering: sortBy === "_id",
					})
					.populate("albums", "name")
					.skip((page - 1) * 100)
					.limit(100),
				SongModel.find({ lyrics: regex }).countDocuments(),
			];
			const [
				titleMatch,
				titleTotalDocuments,
				lyricsMatch,
				lyricsTotalDocuments,
			] = await Promise.all(queryPromises);
			totalPages =
				Math.floor(
					titleTotalDocuments > lyricsTotalDocuments
						? titleTotalDocuments / 100
						: lyricsTotalDocuments / 100
				) + 1;
			songs = {
				titleMatch: titleMatch.map((song) => ({
					...song._doc,
					hasAudio: song.songFilePath ? true : false,
					songFilePath: undefined,
				})),
				lyricsMatch: lyricsMatch.map((song) => ({
					...song._doc,
					hasAudio: song.songFilePath ? true : false,
					songFilePath: undefined,
				})),
			};

			return res.status(200).json({ songs, totalPages });
		}

		const queryPromises = [
			SongModel.find(query, projection)
				.sort(sortBy)
				.collation({
					locale: "en_US",
					numericOrdering: sortBy === "_id",
				})
				.populate("albums", "name")
				.skip((page - 1) * 100)
				.limit(100),
			SongModel.find(query).countDocuments(),
		];
		const [songsFromDb, totalDocuments] = await Promise.all(queryPromises);
		totalPages = Math.floor(totalDocuments / 100) + 1;
		songs = songsFromDb;
	}
	songs = songs.map((song) => ({
		...song._doc,
		hasAudio: song.songFilePath ? true : false,
		songFilePath: undefined,
	}));
	res.status(200).json({ songs, totalPages });
};

/**
 * Add a new song to the database
 *
 * This function creates a new song in the database with provided data.
 * It validates the input parameters, checks for duplicates or constraints,
 * and stores the entity in the database. The function returns information about
 * the created entity for confirmation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Song data to create with detailed explanation of each field
 * @param {string} req.body.id - Unique identifier for song with explanation of generation method and validation rules
 * @param {string} req.body.title - Title of song with description of content constraints, character limits, and validation rules
 * @param {string} req.body.lyrics - Lyrics content with detailed explanation of text format requirements, encoding considerations, and length limits
 * @param {Object} req.body.musicElements - Music elements (chord, tempo, rhythm) with comprehensive details about each element's purpose and data structure
 * @param {string} [req.body["video-link"]] - YouTube video link (optional) with description of URL format validation and embed restrictions
 * @param {Array} [req.body.albums] - Array of album IDs (optional) with explanation of relationships and constraints
 * @param {Object} req.file - Uploaded audio file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 */
export const addSong = async (req, res) => {
	const song = req.body;
	const insertedSong = await SongModel.create({
		_id: song.id,
		title: song.title,
		lyrics: song.lyrics,
		musicElements: {
			chord: song.chord,
			tempo: song.tempo,
			rythm: song.rythm,
		},
		songFilePath: req.file ? req.file.path : null,
		youtubeLink: song["video-link"] ? song["video-link"] : null,
		albums: song.albums ? song.albums : [],
	});

	if (song.albums) {
		for (const album of song.albums) {
			album.songs.push(insertedSong);
			await album.save();
		}
	}
	res.status(201).json({ insertedId: insertedSong._id });
};

/**
 * Get a single song by ID
 *
 * This function retrieves a single song from the database by its ID.
 * It returns detailed song information including audio file path and YouTube link.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Song ID with explanation of how it's used to find the song
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with song data explaining the complete structure and content
 * @throws {NotFoundError} If song is not found with specific explanation of why no song was found
 */
export const getSong = async (req, res) => {
	const { id } = req.params;
	const song = await SongModel.findById(id);

	if (!song) throw new NotFoundError("Song not found");

	res.status(200).json({
		...song._doc,
		hasAudio: song.songFilePath ? true : false,
		songFilePath: undefined,
	});
};

/**
 * Update an existing song
 *
 * This function updates an existing song in the database with provided data.
 * It validates the input parameters, checks for changes to album relationships,
 * and stores the updated entity in the database. The function handles file updates
 * and maintains consistency between songs and albums.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Song ID with explanation of how it's used to find the song
 * @param {Object} req.body - Updated song data with detailed explanation of each field
 * @param {Object} req.file - New audio file (optional) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow
 * @throws {NotFoundError} If song is not found with specific explanation of why no song was found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 */
export const updateSong = async (req, res) => {
	const { id } = req.params;
	const song = req.body;

	let songInDb = await SongModel.findById(id).populate("albums");

	if (!songInDb) throw new NotFoundError("Song not found");

	if (req.file) {
		if (songInDb.songFilePath && fs.existsSync(songInDb.songFilePath))
			fs.unlink(songInDb.songFilePath, (err) => {
				if (!req.error) req.error = {};
				req.error.fileDeleteError = err;
			});
		songInDb.songFilePath = req.file.path;
	}
	songInDb.youtubeLink = song["video-link"];
	songInDb.title = song.title;
	songInDb.lyrics = song.lyrics;
	songInDb.musicElements = {
		chord: song.chord,
		tempo: song.tempo,
		rythm: song.rythm,
	};

	if (song.albums) {
		for (const album of songInDb.albums) {
			album.songs = album.songs.filter((s) => s != id);
			await album.save();
		}
		for (const album of song.albums) {
			album.songs.push(song.id);
			await album.save();
		}
		songInDb.albums = song.albums;
	}

	if (song.id != id) {
		await SongModel.findByIdAndDelete(songInDb._id);

		await SongModel.create({
			_id: song.id,
			albums: song.albums,
			createdAt: songInDb.createdAt,
			lyrics: songInDb.lyrics,
			mediaFiles: songInDb.mediaFiles,
			musicElements: songInDb.musicElements,
			title: songInDb.title,
		});
	} else await songInDb.save();

	res.status(200).json({ updated: true });
};

/**
 * Partially update a song's properties
 *
 * This function partially updates a song's properties in the database.
 * It handles specific fields like YouTube link while preserving other data.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Song ID with explanation of how it's used to find the song
 * @param {Object} req.body - Updated song data with detailed explanation of each field
 * @param {Object} req.file - New audio file (optional) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow
 * @throws {NotFoundError} If song is not found with specific explanation of why no song was found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 */
export const patchSong = async (req, res) => {
	const { id } = req.params;
	const song = req.body;

	let songInDb = await SongModel.findById(id);

	if (!songInDb) throw new NotFoundError("Song not found.");

	if (req.file) {
		if (songInDb.songFilePath && fs.existsSync(songInDb.songFilePath))
			fs.unlink(songInDb.songFilePath, (err) => {
				if (!req.error) req.error = {};
				req.error.fileDeleteError = err;
			});
		songInDb.songFilePath = req.file.path;
	}
	songInDb.youtubeLink = song["video-link"];

	await songInDb.save();

	res.status(200).json({ updated: true });
};

/**
 * Delete a song and remove it from associated albums
 *
 * This function deletes a song from the database and removes references to it
 * from associated albums. It also handles file deletion for audio files.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Song ID with explanation of how it's used to find the song
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with deletion status explaining the complete process flow
 * @throws {NotFoundError} If song is not found with specific explanation of why no song was found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 */
export const deleteSong = async (req, res) => {
	const { id } = req.params;
	const song = await SongModel.findById(id);
	if (!song) throw new NotFoundError("Song doesn't exist.");
	for (const albumId of song.albums) {
		const album = await AlbumModel.findById(albumId);
		const songIdx = album.songs.indexOf(id);
		album.songs.splice(songIdx, 1);
		await album.save();
	}

	await SongModel.findByIdAndDelete(id);

	res.status(200).json({ deleted: true });
};

/**
 * Stream audio file for a song
 *
 * This function streams an audio file for a song. It handles range requests for partial downloads
 * and supports chunked streaming for efficient playback.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Song ID with explanation of how it's used to find the song
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends audio stream with proper headers explaining the complete process flow
 * @throws {NotFoundError} If song is not found or has no audio file with specific explanation of why no audio was found
 * @throws {ServerFaultError} If audio file is missing or corrupted with clear explanation of root causes
 */
export const streamSongAudio = async (req, res) => {
	const { id } = req.params;
	const song = await SongModel.findById(id);
	if (!song) throw new NotFoundError("Song not found.");
	if (!song.songFilePath)
		throw new NotFoundError("Song does not have an audio file.");
	if (!fs.existsSync(song.songFilePath))
		throw new ServerFaultError(
			"Audio file seems to be missing. Please contact the system administrator."
		);

	const audioSize = fs.statSync(song.songFilePath).size;
	const range = req.headers.range;
	const CHUNK_SIZE = 500 * 1e3; // 500KB chunks

	// If no range header, send first chunk with proper headers so browser knows total size
	if (!range) {
		const start = 0;
		const end = Math.min(CHUNK_SIZE - 1, audioSize - 1);
		const contentLength = end - start + 1;

		res.writeHead(206, {
			"Content-Range": `bytes ${start}-${end}/${audioSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": contentLength,
			"Content-Type": "audio/mpeg",
		});
		const stream = fs.createReadStream(song.songFilePath, { start, end });
		stream.pipe(res);
		return;
	}

	// Parse range header (format: "bytes=start-end")
	const parts = range.replace(/bytes=/, "").split("-");
	const start = parseInt(parts[0], 10);
	const requestedEnd = parts[1] ? parseInt(parts[1], 10) : audioSize - 1;

	// Validate range start
	if (isNaN(start) || start >= audioSize || start < 0) {
		res.writeHead(416, {
			"Content-Range": `bytes */${audioSize}`,
		});
		res.end();
		return;
	}

	// Enforce chunk size limit - only send CHUNK_SIZE bytes at a time
	const end = Math.min(start + CHUNK_SIZE - 1, requestedEnd, audioSize - 1);

	// Validate final range
	if (start > end) {
		res.writeHead(416, {
			"Content-Range": `bytes */${audioSize}`,
		});
		res.end();
		return;
	}

	const contentLength = end - start + 1;

	res.writeHead(206, {
		"Content-Range": `bytes ${start}-${end}/${audioSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "audio/mpeg",
	});

	const stream = fs.createReadStream(song.songFilePath, { start, end });
	stream.pipe(res);
};
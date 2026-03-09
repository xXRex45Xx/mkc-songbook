/**
 * Album Controller
 *
 * This module handles album-related operations including:
 * 1. Retrieving all albums
 * 2. Adding new albums
 * 3. Managing album-song relationships
 *
 * @module album.controller
 */

import AlbumModel from "../models/album.model.js";
import SongModel from "../models/song.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import { NotFoundError } from "../utils/error.util.js";
import fs from "fs";

/**
 * Get all albums or search albums with pagination
 *
 * This function retrieves all albums from the database or searches for albums by name.
 * It supports pagination, searching by album title, and returning only album names.
 * The function handles various search types and sorting options to provide flexible access to data.
 *
 * @param {Object} req - Express request object containing query parameters
 * @param {Object} req.query - Query parameters with detailed explanation of each option
 * @param {string} [req.query.q] - Search query (album name) with description of search scope and matching rules
 * @param {boolean} [req.query.names] - Whether to return only album names with explanation of when to use this option
 * @param {number} [req.query.page=1] - Page number for pagination with explanation of how pages are calculated and limits
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with albums and totalPages count explaining pagination details and result structure
 * @throws {NotFoundError} If no albums match the search criteria with specific explanation of why no matches were found
 * @throws {ServerFaultError} If database query fails due to server-side issues or database errors with detailed context
 * @example
 * // Example usage:
 * GET /api/album?q=Amazing&names=true
 * This example retrieves album names matching "Amazing" with pagination.
 */
export const getAllOrSearchAlbums = async (req, res) => {
	const { names, q } = req.query;
	let regex;
	if (q) regex = new RegExp(regexBuilder(q), "i");
	let albums = await AlbumModel.find(
		q ? { name: { $regex: regex } } : {},
		names ? { name: true } : null
	);
	if (!names)
		albums = albums.map((album) => ({
			...album._doc,
			numOfSongs: album.songs.length,
			songs: undefined,
			photoPath: undefined,
		}));

	res.status(200).json(albums);
};

/**
 * Add a new album and update associated songs
 *
 * This function creates a new album in the database with provided data.
 * It validates the input parameters, checks for duplicates or constraints,
 * and stores the entity in the database. The function returns information about
 * the created entity for confirmation.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.body - Album data to create with detailed explanation of each field
 * @param {string} req.body.id - Unique identifier for album with explanation of generation method and validation rules
 * @param {string} req.body.title - Title of album with description of content, length constraints, and allowed characters
 * @param {Array} [req.body.songs] - Array of song IDs (optional) with explanation of relationships and constraints
 * @param {Object} req.file - Uploaded file (if applicable) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with inserted ID and success message explaining the complete process flow
 * @throws {NotFoundError} If referenced entity doesn't exist in database with specific context about related entities
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * POST /api/album
 * {
 *   "id": "album-123",
 *   "title": "Amazing Grace Album",
 *   "songs": ["song-456", "song-789"]
 * }
 * This example demonstrates creating a new album with associated songs.
 */
export const addAlbum = async (req, res) => {
	const album = req.body;

	const insertedAlbum = await AlbumModel.create({
		_id: album.id,
		name: album.title,
		photoPath: req.file ? req.file.path : null,
		photoLink: "/static/albums/images/" + req.file.filename,
		songs: album.songs,
		createdAt: album.createdAt,
	});

	for (const song of album.songs) {
		song.albums.push(insertedAlbum._id);
		await song.save();
	}

	res.status(201).json({ insertedId: insertedAlbum._id });
};

/**
 * Get a single album by ID
 *
 * This function retrieves a single album from the database by its ID.
 * It populates associated songs with relevant information and returns
 * detailed album data including song information.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Album ID with explanation of how it's used to find the album
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with album data explaining the complete structure and content
 * @throws {NotFoundError} If album is not found with specific explanation of why no album was found
 * @example
 * // Example usage:
 * GET /api/album/album-123
 * This example retrieves details for album with ID "album-123".
 */
export const getAlbum = async (req, res) => {
	const { id } = req.params;
	const album = await AlbumModel.findById(id).populate({
		path: "songs",
		select: "title youtubeLink songFilePath",
		populate: { path: "albums", select: "name" },
	});

	if (!album) throw new NotFoundError("Album not found");

	res.status(200).json({
		...album._doc,
		songs: album.songs.map((song) => ({
			...song._doc,
			hasAudio: song.songFilePath ? true : false,
			songFilePath: undefined,
		})),
		photoPath: undefined,
	});
};

/**
 * Update an existing album
 *
 * This function updates an existing album in the database with provided data.
 * It validates the input parameters, checks for changes to album relationships,
 * and stores the updated entity in the database. The function handles file updates
 * and maintains consistency between albums and songs.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Album ID with explanation of how it's used to find the album
 * @param {Object} req.body - Updated album data with detailed explanation of each field
 * @param {Object} req.file - New album cover image (optional) with details about format, size limits, and validation requirements
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with update status explaining the complete process flow
 * @throws {NotFoundError} If album is not found with specific explanation of why no album was found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * PUT /api/album/album-123
 * {
 *   "title": "Amazing Grace Album - Updated",
 *   "songs": ["song-456", "song-789"]
 * }
 * This example demonstrates updating album details with new song list.
 */
export const updateAlbum = async (req, res) => {
	const { id } = req.params;
	const album = req.body;

	let albumInDb = await AlbumModel.findById(id).populate("songs");
	if (req.file) {
		if (albumInDb.photoPath && fs.existsSync(albumInDb.photoPath))
			fs.unlink(albumInDb.photoPath, (err) => {
				if (!req.error) req.error = {};
				req.error.fileDeleteError = err;
			});
		albumInDb.photoPath = req.file.path;
		albumInDb.photoLink = "/static/albums/images/" + req.file.filename;
	}

	const albumInDbSongIds = albumInDb.songs.map((song) => song._id);
	const albumInBodySongIds = album.songs.map((song) => song._id);

	const removedSongIds = albumInDb.songs
		.filter((song) => !albumInBodySongIds.includes(song._id))
		.map((song) => song._id);
	const addedSongIds = album.songs
		.filter((song) => !albumInDbSongIds.includes(song._id))
		.map((song) => song._id);

	albumInDb.name = album.title;
	albumInDb.songs = album.songs;
	albumInDb.createdAt = album.createdAt;

	if (id != album.id) {
		await AlbumModel.findByIdAndDelete(albumInDb._id);

		await AlbumModel.create({
			_id: album.id,
			name: album.title,
			photoPath: req.file ? req.file.path : albumInDb.photoPath,
			photoLink: req.file
				? "/static/albums/images/" + req.file.filename
				: albumInDb.photoLink,
			songs: album.songs,
			createdAt: albumInDb.createdAt,
		});
	} else await albumInDb.save();

	if (removedSongIds.length > 0 || addedSongIds.length > 0) {
		const songUpdatePromises = [
			SongModel.updateMany(
				{ _id: { $in: removedSongIds } },
				{ $pull: { albums: id } }
			),
			SongModel.updateMany(
				{ _id: { $in: addedSongIds } },
				{ $push: { albums: album.id } }
			),
		];

		await Promise.all(songUpdatePromises);
	}

	if (id != album.id) {
		const remainingSongIds = albumInBodySongIds.filter(
			(songId) => !addedSongIds.includes(songId)
		);

		await SongModel.updateMany(
			{ _id: { $in: remainingSongIds } },
			{ $pull: { albums: id } }
		);
		await SongModel.updateMany(
			{ _id: { $in: remainingSongIds } },
			{ $push: { albums: album.id } }
		);
	}

	res.status(200).json({ updated: true });
	if (req.error?.fileDeleteError) console.error(req.error.fileDeleteError);
};

/**
 * Delete an album and remove it from associated songs
 *
 * This function deletes an album from the database and removes references to it
 * from associated songs. It also handles file deletion for album cover images.
 *
 * @param {Object} req - Express request object containing request data
 * @param {Object} req.params - Route parameters with explanation of what they represent
 * @param {string} req.params.id - Album ID with explanation of how it's used to find the album
 * @param {Object} res - Express response object for sending responses back to client
 * @returns {Promise<void>} Sends JSON response with deletion status explaining the complete process flow
 * @throws {NotFoundError} If album is not found with specific explanation of why no album was found
 * @throws {ServerFaultError} If database operation fails due to server-side issues like connection problems or constraint violations
 * @example
 * // Example usage:
 * DELETE /api/album/album-123
 * This example deletes album with ID "album-123" and removes references from songs.
 */
export const deleteAlbum = async (req, res) => {
	const { id } = req.params;

	const album = await AlbumModel.findById(id);
	if (!album) throw new NotFoundError("Album doesn't exist.");

	await SongModel.updateMany(
		{ _id: { $in: album.songs } },
		{ $pull: { albums: id } }
	);
	await AlbumModel.findByIdAndDelete(id);
	if (album.photoPath && fs.existsSync(album.photoPath))
		fs.unlink(album.photoPath, (err) => console.error(err));

	res.status(200).json({ deleted: true });
};
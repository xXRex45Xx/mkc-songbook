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

/**
 * Get all albums with optional name-only projection
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {boolean} [req.query.names] - Whether to return only album names
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with albums
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
 * @param {Object} req - Express request object
 * @param {Object} req.body - Album data
 * @param {string} req.body.id - Album ID
 * @param {string} req.body.title - Album title
 * @param {Array} req.body.songs - Array of song IDs
 * @param {Object} req.file - Album cover photo (optional)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with inserted album ID
 */
export const addAlbum = async (req, res) => {
	const album = req.body;

	const insertedAlbum = await AlbumModel.create({
		_id: album.id,
		name: album.title,
		photoPath: req.file ? req.file.path : null,
		photoLink: "/static/albums/images/" + req.file.filename,
		songs: album.songs,
	});

	for (const song of album.songs) {
		song.albums.push(insertedAlbum._id);
		await song.save();
	}

	res.status(201).json({ insertedId: insertedAlbum._id });
};

export const getAlbum = async (req, res) => {
	const { id } = req.params;
	const album = await AlbumModel.findById(id).populate({
		path: "songs",
		select: "title",
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

export const updateAlbum = async (req, res) => {
	const { id } = req.params;
	const album = req.body;

	let albumInDb = await AlbumModel.findById(id).populate("songs");
	if (req.file) {
		if (albumInDb.photoPath)
			fs.unlink(
				albumInDb.photoPath,
				(err) => (req.error.fileDeleteError = err)
			);
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
};

export const deleteAlbum = async (req, res) => {
	const { id } = req.params;

	const album = await AlbumModel.findById(id);
	if (!album) throw new NotFoundError("Album doesn't exist.");

	await SongModel.updateMany(
		{ _id: { $in: album.songs } },
		{ $pull: { albums: id } }
	);
	await AlbumModel.findByIdAndDelete(id);

	res.status(200).json({ deleted: true });
};

import AlbumModel from "../models/album.model.js";
import SongModel from "../models/song.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import { NotFoundError } from "../utils/error.util.js";
import fs from "fs";

export const getAllOrSearchSongs = async (req, res) => {
    const { q, page = 1, all, type, sortBy } = req.query;
    let songs, totalPages;
    if (all) songs = await SongModel.find();
    else if (!q) {
        songs = await SongModel.find({}, { title: true })
            .sort(sortBy)
            .collation({ locale: "en_US", numericOrdering: sortBy === "_id" })
            .populate("albums", "name")
            .skip((page - 1) * 100)
            .limit(100);
        const totalDocuments = await SongModel.find({}).countDocuments();
        totalPages = Math.floor(totalDocuments / 100) + 1;
    } else {
        const regex = new RegExp(regexBuilder(q), "i");
        if (type === "title") {
            songs = await SongModel.find({ title: regex }, { title: true })
                .sort(sortBy)
                .collation({
                    locale: "en_US",
                    numericOrdering: sortBy === "_id",
                })
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
            const totalDocuments = await SongModel.find({
                title: regex,
            }).countDocuments();
            totalPages = Math.floor(totalDocuments / 100) + 1;
        } else if (type === "lyrics") {
            songs = await SongModel.find({ lyrics: regex }, { title: true })
                .sort(sortBy)
                .collation({
                    locale: "en_US",
                    numericOrdering: sortBy === "_id",
                })
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
            const totalDocuments = await SongModel.find({
                lyrics: regex,
            }).countDocuments();
            totalPages = Math.floor(totalDocuments / 100) + 1;
        } else if (type === "id") {
            songs = await SongModel.find({ _id: q }, { title: true })
                .sort(sortBy)
                .collation({
                    locale: "en_US",
                    numericOrdering: sortBy === "_id",
                })
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
            const totalDocuments = await SongModel.find({
                _id: q,
            }).countDocuments();
            totalPages = Math.floor(totalDocuments / 100) + 1;
        } else {
            songs = {
                titleMatch: await SongModel.find(
                    { title: regex },
                    { title: true }
                )
                    .sort(sortBy)
                    .collation({
                        locale: "en_US",
                        numericOrdering: sortBy === "_id",
                    })
                    .populate("albums", "name")
                    .skip((page - 1) * 100)
                    .limit(100),
                lyricsMatch: await SongModel.find(
                    { lyrics: regex },
                    { title: true }
                )
                    .sort(sortBy)
                    .collation({
                        locale: "en_US",
                        numericOrdering: sortBy === "_id",
                    })
                    .populate("albums", "name")
                    .skip((page - 1) * 100)
                    .limit(100),
            };
            const titleTotalDocuments = await SongModel.find({
                title: regex,
            }).countDocuments();
            const lyricsTotalDocuments = await SongModel.find({
                lyrics: regex,
            }).countDocuments();

            totalPages =
                Math.floor(
                    titleTotalDocuments > lyricsTotalDocuments
                        ? titleTotalDocuments / 100
                        : lyricsTotalDocuments / 100
                ) + 1;
        }
    }
    res.status(200).json({ songs, totalPages });
};

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

export const updateSong = async (req, res) => {
    const { id } = req.params;
    const song = req.body;

    let songInDb = await SongModel.findById(id).populate("albums");

    if (req.file) {
        if (songInDb.songFilePath)
            fs.unlink(
                songInDb.songFilePath,
                (err) => (req.error.fileDeleteError = err)
            );
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

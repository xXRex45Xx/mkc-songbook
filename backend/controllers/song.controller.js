import MediaFileModel from "../models/media-file.model.js";
import SongModel from "../models/song.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import { NotFoundError } from "../utils/error.util.js";

export const getAllOrSearchSongs = async (req, res) => {
    const { q, page = 1, all, type } = req.query;
    let songs;
    if (all) songs = await SongModel.find();
    else if (!q)
        songs = await SongModel.find({}, { title: true })
            .sort("_id")
            .populate("albums", "name")
            .skip((page - 1) * 100)
            .limit(100);
    else {
        const regex = new RegExp(regexBuilder(q), "i");
        if (type === "title")
            songs = await SongModel.find({ title: regex }, { title: true })
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
        else if (type === "lyrics")
            songs = await SongModel.find({ lyrics: regex }, { title: true })
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
        else if (type === "id")
            songs = await SongModel.find({ _id: parseInt(q) }, { title: true })
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
        else
            songs = {
                titleMatch: await SongModel.find(
                    { title: regex },
                    { title: true }
                )
                    .populate("albums", "name")
                    .skip((page - 1) * 100)
                    .limit(100),
                lyricsMatch: await SongModel.find(
                    { lyrics: regex },
                    { title: true }
                )
                    .populate("albums", "name")
                    .skip((page - 1) * 100)
                    .limit(100),
            };
    }
    res.status(200).json(songs);
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
    });

    res.status(201).json({ insertedId: insertedSong._id });
};

export const getSong = async (req, res) => {
    const { id } = req.params;

    const song = await SongModel.findById(id).populate("mediaFiles");

    if (!song) throw new NotFoundError("Song not found");

    res.status(200).json(song);
};

export const updateSong = async (req, res) => {
    const { id } = req.params;
    const song = req.body;

    await SongModel.findByIdAndUpdate(id, {
        _id: song.id,
        title: song.title,
        lyrics: song.lyrics,
        musicElements: {
            chord: song.chord,
            tempo: song.tempo,
            rythm: song.rythm,
        },
    });

    res.status(200).json({ updated: true });
};

export const deleteSong = async (req, res) => {
    const { id } = req.params;

    await MediaFileModel.deleteMany({ songId: id });
    await SongModel.findByIdAndDelete(id);

    res.status(200).json({ deleted: true });
};

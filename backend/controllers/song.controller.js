import MediaFileModel from "../models/media-file.model.js";
import SongModel from "../models/song.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";
import { NotFoundError, ServerFaultError } from "../utils/error.util.js";

export const getAllOrSearchSongs = async (req, res) => {
    const { q, page = 1, all, type, sortBy } = req.query;
    let songs, totalPages;
    if (all) songs = await SongModel.find();
    else if (!q) {
        songs = await SongModel.find({}, { title: true })
            .sort(sortBy)
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
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
            const totalDocuments = await SongModel.find({
                lyrics: regex,
            }).countDocuments();
            totalPages = Math.floor(totalDocuments / 100) + 1;
        } else if (type === "id") {
            songs = await SongModel.find({ _id: parseInt(q) }, { title: true })
                .sort(sortBy)
                .populate("albums", "name")
                .skip((page - 1) * 100)
                .limit(100);
            const totalDocuments = await SongModel.find({
                _id: parseInt(q),
            }).countDocuments();
            totalPages = Math.floor(totalDocuments / 100) + 1;
        } else {
            songs = {
                titleMatch: await SongModel.find(
                    { title: regex },
                    { title: true }
                )
                    .sort(sortBy)
                    .populate("albums", "name")
                    .skip((page - 1) * 100)
                    .limit(100),
                lyricsMatch: await SongModel.find(
                    { lyrics: regex },
                    { title: true }
                )
                    .sort(sortBy)
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
    });

    if (req.file)
        await MediaFileModel.create({
            songId: insertedSong.id,
            filePath: req.file.path,
            fileType: "Audio",
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

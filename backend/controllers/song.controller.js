import SongModel from "../models/song.model.js";
import { regexBuilder } from "../utils/amharic-map.util.js";

export const getAllOrSearchSongs = async (req, res, next) => {
    const { q, page } = req.query;

    let songs;
    if (!q)
        songs = await SongModel.find()
            .skip((page - 1) * 100)
            .limit(100);
    else {
        const regex = new RegExp(regexBuilder(q), "i");
        songs = {
            titleMatch: await SongModel.find(
                { title: regex },
                { _id: true, title: true }
            ),
            lyricsMatch: await SongModel.find(
                { title: regex },
                { _id: true, title: true }
            ),
        };
    }
    res.status(200).json(songs);
};

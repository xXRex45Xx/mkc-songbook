import mongoose from "mongoose";
import MediaFileModel from "../models/media-file.model.js";
import SongModel from "../models/song.model.js";
import AlbumModel from "../models/album.model.js";

export const connect = async (uri) => {
    try {
        await mongoose.connect(uri);
    } catch (err) {
        console.error(err);
        throw err;
    }
};

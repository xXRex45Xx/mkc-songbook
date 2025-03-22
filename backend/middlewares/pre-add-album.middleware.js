import SongModel from "../models/song.model.js";
import { ClientFaultError } from "../utils/error.util.js";
import AlbumModel from "../models/album.model.js";

export const checkSongExists = async (req, _res, next) => {
    const { songs: songIds } = req.body;
    let songs = [];

    for (const songId of songIds) {
        songs.push(SongModel.findById(songId));
    }

    songs = await Promise.all(songs);
    const songIdsWithNull = songs.filter((song) => song === null);
    if (songIdsWithNull.length > 0) {
        let errorMessage = "The following song ids don't exist: ";
        songIdsWithNull.forEach((songId, idx) => {
            if (idx === songIdsWithNull.length - 1) {
                errorMessage += songId;
                return;
            }
            errorMessage += `${songId}, `;
        });
        throw new ClientFaultError(errorMessage);
    }

    req.body.songs = songs;
    next();
};

export const checkAlbumExists = async (req, _res, next) => {
    const {id} = req.body;
    const album = await AlbumModel.findById(id);
    if(album)
        throw new ClientFaultError(`Album with id ${album._id} already exists.`);
    next();
}
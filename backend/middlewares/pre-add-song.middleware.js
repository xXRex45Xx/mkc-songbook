import SongModel from "../models/song.model.js";
import AlbumModel from "../models/album.model.js";
import { ClientFaultError } from "../utils/error.util.js";

export const checkSongNumberExists = async (req, _res, next) => {
    const { id } = req.body;
    const song = await SongModel.findById(id);
    if (song)
        throw new ClientFaultError(
            "A song exists with the provided song number"
        );
    next();
};

export const checkAlbumExists = async (req, _res, next) => {
    const { album: albumId } = req.body;
    if (!albumId) return next();
    const album = await AlbumModel.findById(albumId);
    if (!album) throw new ClientFaultError("The provided album doesn't exist.");
    req.body.album = album;
    next();
};

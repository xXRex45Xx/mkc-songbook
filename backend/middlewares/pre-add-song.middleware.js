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
    const { albums: albumIds } = req.body;
    if (!albumIds) return next();
    const albums = [];
    for (const albumId of albumIds.split(",")) {
        const album = await AlbumModel.findById(albumId);
        if (!album)
            throw new ClientFaultError(
                `The album with id "${albumId}" doesn't exist.`
            );
        albums.push(album);
    }
    req.body.albums = albums;
    next();
};

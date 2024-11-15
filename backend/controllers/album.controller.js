import AlbumModel from "../models/album.model.js";

export const getAllOrSearchAlbums = async (req, res) => {
    const { names } = req.query;
    const albums = await AlbumModel.find({}, names ? { name: true } : null);
    res.status(200).json(albums);
};

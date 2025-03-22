import AlbumModel from "../models/album.model.js";

export const getAllOrSearchAlbums = async (req, res) => {
    const { names } = req.query;
    const albums = await AlbumModel.find({}, names ? { name: true } : null);
    res.status(200).json(albums);
};

export const addAlbum = async (req, res) => {
    const album = req.body;
    const insertedAlbum = await AlbumModel.create({
        _id: album.id,
        name: album.title,
        photo: req.file ? req.file.path : null,
        songs: album.songs,
    });

    for (const song of album.songs) {
        song.albums.push(insertedAlbum._id);
        await song.save();
    }

    res.status(201).json({ insertedId: insertedAlbum._id });
};

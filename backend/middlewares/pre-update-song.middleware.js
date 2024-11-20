import SongModel from "../models/song.model.js";
import { ClientFaultError } from "../utils/error.util.js";

export const checkSongNumberConflict = async (req, _res, next) => {
    const { id } = req.body;
    const { id: songId } = req.params;

    if (songId == id) return next();

    const song = await SongModel.findById(id);
    if (song)
        throw new ClientFaultError(
            "A song exists with the provided song number."
        );
    next();
};

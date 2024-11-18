import { Router } from "express";
import {
    addSong,
    deleteSong,
    getAllOrSearchSongs,
    getSong,
    updateSong,
} from "../controllers/song.controller.js";
import { wrapAsync } from "../utils/error.util.js";
import {
    validateCreateSong,
    validateGetAllSongs,
    validateGetSong,
} from "../middlewares/song-validation.middleware.js";
import mapSongSortBy from "../middlewares/song-map-sortby.middleware.js";
import { audioUpload } from "../middlewares/file-upload.middleware.js";
import {
    checkAlbumExists,
    checkSongNumberExists,
} from "../middlewares/pre-add-song.middleware.js";

const songRouter = Router();

songRouter
    .route("/")
    .get(
        wrapAsync(validateGetAllSongs),
        wrapAsync(mapSongSortBy),
        wrapAsync(getAllOrSearchSongs)
    )
    .post(
        audioUpload.single("audio-file"),
        wrapAsync(validateCreateSong),
        wrapAsync(checkSongNumberExists),
        wrapAsync(checkAlbumExists),
        wrapAsync(addSong)
    );

songRouter
    .route("/:id")
    .get(wrapAsync(validateGetSong), wrapAsync(getSong))
    .patch(wrapAsync(updateSong))
    .delete(wrapAsync(validateGetSong), wrapAsync(deleteSong));

export default songRouter;

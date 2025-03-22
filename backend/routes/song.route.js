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
import { checkSongNumberConflict } from "../middlewares/pre-update-song.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";

const songRouter = Router();

songRouter
    .route("/")
    .get(
        wrapAsync(validateGetAllSongs),
        wrapAsync(mapSongSortBy),
        wrapAsync(getAllOrSearchSongs)
    )
    .post(
        passport.authenticate("jwt", {
            session: false,
        }),
        wrapAsync(roleBasedAuthorization(["admin"])),
        audioUpload.single("audio-file"),
        wrapAsync(validateCreateSong),
        wrapAsync(checkSongNumberExists),
        wrapAsync(checkAlbumExists),
        wrapAsync(addSong)
    );

songRouter
    .route("/:id")
    .get(wrapAsync(validateGetSong), wrapAsync(getSong))
    .put(
        passport.authenticate("jwt", {
            session: false,
        }),
        wrapAsync(roleBasedAuthorization(["admin"])),
        audioUpload.single("audio-file"),
        wrapAsync(validateCreateSong),
        wrapAsync(checkSongNumberConflict),
        wrapAsync(checkAlbumExists),
        wrapAsync(updateSong)
    )
    .delete(wrapAsync(validateGetSong), wrapAsync(deleteSong));

export default songRouter;

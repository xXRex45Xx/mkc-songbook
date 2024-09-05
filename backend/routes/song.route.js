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
    validateGetAllSongs,
    validateGetSong,
} from "../middlewares/song-validation.middleware.js";

const songRouter = Router();

songRouter
    .route("/")
    .get(wrapAsync(validateGetAllSongs), wrapAsync(getAllOrSearchSongs))
    .post(wrapAsync(addSong));
songRouter
    .route("/:id")
    .get(wrapAsync(validateGetSong), wrapAsync(getSong))
    .patch(wrapAsync(updateSong))
    .delete(wrapAsync(deleteSong));

export default songRouter;

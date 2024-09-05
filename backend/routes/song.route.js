import { Router } from "express";
import {
    addSong,
    deleteSong,
    getAllOrSearchSongs,
    getSong,
    updateSong,
} from "../controllers/song.controller.js";
import { wrapAsync } from "../utils/error.util.js";

const songRouter = Router();

songRouter
    .route("/")
    .get(wrapAsync(getAllOrSearchSongs))
    .post(wrapAsync(addSong));
songRouter
    .route("/:id")
    .get(wrapAsync(getSong))
    .patch(wrapAsync(updateSong))
    .delete(wrapAsync(deleteSong));

export default songRouter;

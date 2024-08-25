import { Router } from "express";
import {
    addSong,
    getAllOrSearchSongs,
    getSong,
    updateSong,
} from "../controllers/song.controller.js";

const songRouter = Router();

songRouter.route("/").get(getAllOrSearchSongs).post(addSong);
songRouter.route("/:id").get(getSong).patch(updateSong).delete();

export default songRouter;

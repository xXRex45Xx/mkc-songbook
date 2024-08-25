import { Router } from "express";
import {
    addSong,
    getAllOrSearchSongs,
    getSong,
} from "../controllers/song.controller.js";

const songRouter = Router();

songRouter.route("/").get(getAllOrSearchSongs).post(addSong);
songRouter.route("/:id").get(getSong).patch();

export default songRouter;

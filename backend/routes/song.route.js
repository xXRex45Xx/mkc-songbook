import { Router } from "express";
import {
    addSong,
    getAllOrSearchSongs,
} from "../controllers/song.controller.js";

const songRouter = Router();

songRouter.route("/").get(getAllOrSearchSongs).post(addSong);
songRouter.route("/:id").get().patch();

export default songRouter;

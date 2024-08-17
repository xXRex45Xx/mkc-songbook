import { Router } from "express";
import { getAllOrSearchSongs } from "../controllers/song.controller.js";

const songRouter = Router();

songRouter.route("/").get(getAllOrSearchSongs).post();
songRouter.route("/:id").get().patch();

export default songRouter;

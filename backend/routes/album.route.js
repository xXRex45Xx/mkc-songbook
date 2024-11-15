import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import { getAllOrSearchAlbums } from "../controllers/album.controller.js";

const albumRouter = Router();

albumRouter.route("/").get(wrapAsync(getAllOrSearchAlbums));

export default albumRouter;

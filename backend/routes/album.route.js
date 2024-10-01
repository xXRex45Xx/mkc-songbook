import { Router } from "express";
import { getAllOrSearchAlbum } from "../controllers/album.controller.js";

import { wrapAsync } from "../utils/error.util.js";
const albumRouter = Router();

albumRouter.route("/").get(wrapAsync(getAllOrSearchAlbum));

export default albumRouter;

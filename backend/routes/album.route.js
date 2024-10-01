import { Router } from "express";
import { getAllOrSearchAlbum } from "../controllers/album.controller.js";

import { wrapAsync } from "../utils/error.util.js";
import { validateGetAllAlbums } from "../middlewares/album-validation.middleware.js";

const albumRouter = Router();

albumRouter
	.route("/")
	.get(wrapAsync(validateGetAllAlbums), wrapAsync(getAllOrSearchAlbum));

export default albumRouter;

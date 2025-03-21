import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import {
    addAlbum,
    getAllOrSearchAlbums,
} from "../controllers/album.controller.js";

const albumRouter = Router();

albumRouter
    .route("/")
    .get(wrapAsync(getAllOrSearchAlbums))
    .post(wrapAsync(addAlbum));

export default albumRouter;

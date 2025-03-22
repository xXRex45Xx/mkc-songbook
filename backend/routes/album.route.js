import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import {
    addAlbum,
    getAllOrSearchAlbums,
} from "../controllers/album.controller.js";
import { albumImageUpload } from "../middlewares/file-upload.middleware.js";
import { validateCreateAlbum } from "../middlewares/album-validation.middleware.js";
import {
    checkAlbumExists,
    checkSongExists,
} from "../middlewares/pre-add-album.middleware.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";

const albumRouter = Router();

albumRouter
    .route("/")
    .get(wrapAsync(getAllOrSearchAlbums))
    .post(
        passport.authenticate("jwt", { session: false }),
        wrapAsync(roleBasedAuthorization(["admin"])),
        albumImageUpload.single("cover"),
        wrapAsync(validateCreateAlbum),
        wrapAsync(checkAlbumExists),
        wrapAsync(checkSongExists),
        wrapAsync(addAlbum)
    );

export default albumRouter;

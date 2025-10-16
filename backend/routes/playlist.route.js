import { Router } from "express";
import passport from "passport";
import { wrapAsync } from "../utils/error.util.js";
import {
	createPlaylist,
	deletePlaylist,
	getAllOrSearchPlaylists,
	getPlaylist,
	updatePlaylist,
} from "../controllers/playlist.controller.js";
import { checkSongExists } from "../middlewares/pre-add-album.middleware.js";
import {
	validateCreatePlaylist,
	validateGetAllPlaylists,
	validateGetPlaylist,
	validateUpdatePlaylist,
} from "../middlewares/playlist-validation.middleware.js";
import { optionalAuth } from "../middlewares/authorization.middleware.js";

const playlistRouter = Router();

playlistRouter
	.route("/")
	.get(
		wrapAsync(optionalAuth),
		wrapAsync(validateGetAllPlaylists),
		wrapAsync(getAllOrSearchPlaylists)
	)
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateCreatePlaylist),
		wrapAsync(checkSongExists),
		wrapAsync(createPlaylist)
	);
playlistRouter
	.route("/:id")
	.get(
		wrapAsync(optionalAuth),
		wrapAsync(validateGetPlaylist),
		wrapAsync(getPlaylist)
	)
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateGetPlaylist),
		wrapAsync(validateUpdatePlaylist),
		wrapAsync(checkSongExists),
		wrapAsync(updatePlaylist)
	)
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(validateGetPlaylist),
		wrapAsync(deletePlaylist)
	);

export default playlistRouter;

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

const playlistRouter = Router();

playlistRouter
	.route("/")
	.get(wrapAsync(getAllOrSearchPlaylists))
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(createPlaylist)
	);
playlistRouter
	.route("/:id")
	.get(wrapAsync(getPlaylist))
	.put(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(updatePlaylist)
	)
	.delete(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(deletePlaylist)
	);

export default playlistRouter;

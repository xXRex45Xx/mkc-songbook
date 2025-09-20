import { Router } from "express";
import passport from "passport";
import { wrapAsync } from "../utils/error.util.js";
import {
	createPlaylist,
	getAllOrSearchPlaylists,
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
	.get()
	.put(passport.authenticate("jwt", { session: false }))
	.delete(passport.authenticate("jwt", { session: false }));

export default playlistRouter;

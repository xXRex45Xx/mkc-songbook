import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import {
	addLog,
	getAllOrSearchLogBook,
} from "../controllers/service-logbook.controller.js";
import passport from "passport";
import roleBasedAuthorization from "../middlewares/authorization.middleware.js";
import {
	validateCreateLogBook,
	validateGetAllLogBooks,
} from "../middlewares/service-logbook-validation.middleware.js";
import { checkSongExists } from "../middlewares/pre-add-album.middleware.js";

const logBookRouter = Router();

logBookRouter
	.route("/")
	.get(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["member", "admin", "super-admin"])),
		wrapAsync(validateGetAllLogBooks),
		wrapAsync(getAllOrSearchLogBook)
	)
	.post(
		passport.authenticate("jwt", { session: false }),
		wrapAsync(roleBasedAuthorization(["admin", "super-admin"])),
		wrapAsync(validateCreateLogBook),
		wrapAsync(checkSongExists),
		wrapAsync(addLog)
	);

logBookRouter.route("/:id").get().put().delete();

export default logBookRouter;

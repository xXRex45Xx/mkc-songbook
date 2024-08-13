import { Router } from "express";

const songRouter = Router();

songRouter.route("/").get().post();
songRouter.route("/:id").get().patch();

export default songRouter;

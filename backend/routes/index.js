import { Router } from "express";
import songRouter from "./song.route.js";

const apiRouter = Router();

apiRouter.use("/song", songRouter);

export default apiRouter;

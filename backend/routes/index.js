import { Router } from "express";
import songRouter from "./song.route.js";
import albumRouter from "./album.route.js";

const apiRouter = Router();

apiRouter.use("/song", songRouter);
apiRouter.use("/album", albumRouter);

export default apiRouter;

import { Router } from "express";
import songRouter from "./song.route.js";
import userRouter from "./user.route.js";
import albumRouter from "./album.route.js";

const apiRouter = Router();

apiRouter.use("/song", songRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/album", albumRouter);

export default apiRouter;

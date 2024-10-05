import { Router } from "express";
import songRouter from "./song.route.js";
import userRouter from "./user.route.js";

const apiRouter = Router();

apiRouter.use("/song", songRouter);
apiRouter.use("/user", userRouter);

export default apiRouter;

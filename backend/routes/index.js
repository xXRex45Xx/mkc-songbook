/**
 * Main API Router Configuration.
 * Configures and combines all route modules into a single router.
 * All routes are prefixed with '/api' when mounted in the main application.
 * @module routes/index
 */

import { Router } from "express";
import songRouter from "./song.route.js";
import userRouter from "./user.route.js";
import albumRouter from "./album.route.js";
import logBookRouter from "./service-logbook.route.js";
import playlistRouter from "./playlist.route.js";

/**
 * Express router instance for all API routes.
 * Mounts all sub-routers with their respective path prefixes:
 * - /api/song - Song management routes
 * - /api/user - User authentication and management routes
 * - /api/album - Album management routes
 * @type {Router}
 */
const apiRouter = Router();

apiRouter.use("/song", songRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/album", albumRouter);
apiRouter.use("/logbook", logBookRouter);
apiRouter.use("/playlist", playlistRouter);

export default apiRouter;

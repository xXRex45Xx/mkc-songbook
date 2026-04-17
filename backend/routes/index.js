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
 * Mounts all sub-routers with their respective path prefixes.
 * This router is mounted at /api in the main application,
 * creating the full route paths for all endpoints.
 *
 * Route module imports:
 * - song.route.js: Song CRUD operations (title, lyrics, albums, audio files)
 * - user.route.js: User authentication and management (login, registration, OTP)
 * - album.route.js: Album CRUD operations with cover images
 * - service-logbook.route.js: Service logbook functionality
 * - playlist.route.js: Playlist management
 *
 * @example
 *   // Example request routing:
 *   // GET /api/song?q=hymn              -> songRouter with /song prefix
 *   // POST /api/user/login              -> userRouter with /user prefix
 *   // GET /api/album/:id                -> albumRouter with /album prefix
 *   // POST /api/logbook/record          -> logBookRouter with /logbook prefix
 *   // DELETE /api/playlist/:id          -> playlistRouter with /playlist prefix
 */
const apiRouter = Router();

/**
 * Mount song management routes at /api/song.
 * Handles song CRUD operations including:
 * - Search and list songs with pagination
 * - Create and update songs (admin only)
 * - Delete songs (admin only)
 * - Upload audio files and manage album associations
 *
 * @example
 *   // Example song routes:
 *   // GET /api/song?q=grace              Search songs containing "grace"
 *   // GET /api/song?page=2&sortBy=title   Paginated results sorted by title
 *   // POST /api/song                     Create new song (admin only)
 *   // PUT /api/song/:id                  Update song (admin only)
 *   // DELETE /api/song/:id               Delete song (admin only)
 */
apiRouter.use("/song", songRouter);

/**
 * Mount user authentication and management routes at /api/user.
 * Handles user operations including:
 * - Email/password login with JWT tokens
 * - Google OAuth authentication
 * - OTP-based registration and password reset
 * - User profile management
 * - Admin user role updates
 *
 * @example
 *   // Example user routes:
 *   // POST /api/user/login               Login with email/password
 *   // POST /api/user/otp                 Request OTP for verification
 *   // POST /api/user/verify-otp          Verify OTP code
 *   // PUT /api/user/reset-password       Reset password with OTP
 *   // GET /api/user/current-user         Get current user profile (authenticated)
 */
apiRouter.use("/user", userRouter);

/**
 * Mount album management routes at /api/album.
 * Handles album CRUD operations including:
 * - Search and list albums
 * - Create and update albums with cover images
 * - Delete albums (admin only)
 * - Manage album-song associations
 * - Upload album cover images
 *
 * @example
 *   // Example album routes:
 *   // GET /api/album                     List all albums
 *   // GET /api/album/:id                 Get album by ID
 *   // POST /api/album                    Create new album (admin only)
 *   // PUT /api/album/:id                 Update album (admin only)
 *   // DELETE /api/album/:id              Delete album (admin only)
 */
apiRouter.use("/album", albumRouter);

/**
 * Mount service logbook routes at /api/logbook.
 * Handles service logbook functionality:
 * - Record and manage service logs
 * - Track choir service activities
 *
 * @example
 *   // Example logbook routes:
 *   // POST /api/logbook/record           Create service log entry
 *   // GET /api/logbook                   List all service logs
 */
apiRouter.use("/logbook", logBookRouter);

/**
 * Mount playlist management routes at /api/playlist.
 * Handles playlist operations:
 * - Create and manage playlists
 * - Add/remove songs from playlists
 * - Delete playlists
 *
 * @example
 *   // Example playlist routes:
 *   // POST /api/playlist                 Create new playlist
 *   // GET /api/playlist                  List all playlists
 *   // PUT /api/playlist/:id              Update playlist
 *   // DELETE /api/playlist/:id           Delete playlist
 */
apiRouter.use("/playlist", playlistRouter);

export default apiRouter;

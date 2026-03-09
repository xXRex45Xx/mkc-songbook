/**
 * Main Application Entry Point.
 * Sets up the Express server with middleware, routes, and error handling.
 * Initializes database connection and default admin user.
 * @module index
 */

import { config } from "dotenv";
import { connect } from "./config/db.js";
import express from "express";
import apiRouter from "./routes/index.js";
import cors from "cors";
import "./config/nodemailer.config.js";
import "./config/passport.config.js";
import { MulterError } from "multer";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import initDb from "./init-db/init-db.js";
import path from "path";
import { wrapAsync } from "./utils/error.util.js";

if (process.env.NODE_ENV !== "production") {
	const configError = config().error;

	if (configError) throw configError;
}

const app = express();

/**
 * Custom Morgan tokens for logging errors.
 * Adds error message and file deletion error tokens to the logging format.
 * These tokens are used in the custom Morgan log format to capture
 * error information from the global error handling middleware.
 *
 * @param {Request} req - Express request object to extract error message from
 * @returns {string} The error message from req.error, or empty string if not present
 * @example
 * // Returns error message: "Database connection failed"
 * morgan.token("error", (req) => req.error?.message || "");
 */
morgan.token("error", (req) => req.error?.message || "");

/**
 * Custom Morgan token for logging file deletion errors.
 * Captures file deletion error messages that occur during the global error handling
 * cleanup process when uploaded files fail to delete on error.
 *
 * @param {Request} req - Express request object to extract file deletion error from
 * @returns {string} The file deletion error message from req.fileDeleteError,
 *                   or empty string if not present
 * @example
 * // Returns file deletion error: "Failed to delete uploaded file"
 * morgan.token("fileerror", (req) => req.fileDeleteError?.message || "");
 */
morgan.token("fileerror", (req) => req.fileDeleteError?.message || "");

/**
 * Express application setup with security and utility middleware.
 * Configures the core middleware stack for the application:
 * - Helmet for security headers (X-Content-Type-Options, X-Frame-Options, etc.)
 * - Morgan for request logging with custom error tokens
 * - CORS with configured allowed origins from environment variables
 * - JSON body parser for request bodies
 * - API routes mounted at /api prefix
 *
 * The middleware order is critical:
 * 1. Helmet must be first for security headers
 * 2. Morgan logs all requests before they are processed
 * 3. CORS must be before route handlers for proper preflight handling
 * 4. Static file middleware serves album images
 * 5. JSON parser handles request bodies
 * 6. API router handles all REST endpoints
 *
 * @example
 * // Example request flow:
 * // 1. Request arrives -> Helmet adds security headers
 * // 2. Request logged by Morgan -> ":method :url :status :res[content-length] - :response-time ms :error :fileerror"
 * // 3. CORS checks origin against ALLOWED_ORIGINS
 * // 4. Request routed to /api/... or static files
 * // 5. Response sent with status code and JSON body
 */
app.use(helmet());
app.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms :error :fileerror"
	)
);

/**
 * CORS middleware configuration.
 * Enables cross-origin resource sharing for the API with origins
 * specified in the ALLOWED_ORIGINS environment variable.
 * The origins are parsed from a comma-separated string into an array.
 *
 * @param {Object} corsOptions - CORS configuration options
 * @param {Array<string>} corsOptions.origin - Array of allowed origins parsed from
 *                                             process.env.ALLOWED_ORIGINS
 * @example
 * // Example ALLOWED_ORIGINS environment variable:
 * // "http://localhost:3000,https://example.com,https://admin.example.com"
 * // Results in CORS allowing requests from all three origins
 * app.use(
 *   cors({
 *     origin: process.env.ALLOWED_ORIGINS.split(","),
 *   })
 * );
 */
app.use(
	cors({
		origin: process.env.ALLOWED_ORIGINS.split(","),
	})
);

/**
 * Static file middleware for album images.
 * Serves album image files from the uploads/images/albums directory
 * with custom security headers for cross-origin access.
 * The wrapAsync function ensures any async errors are properly handled
 * by the global error handling middleware.
 *
 * Security headers added:
 * - Access-Control-Allow-Origin: Set to allowed origins for cross-origin requests
 * - Cross-Origin-Resource-Policy: cross-origin allows access from any origin
 *
 * @param {Request} req - Express request object for the static file request
 * @param {Response} res - Express response object for setting headers
 * @param {NextFunction} next - Express next function to pass to static middleware
 * @returns {Promise<void>} Resolves when headers are set and static file handling completes
 * @example
 * // Example request to album image:
 * // GET /static/albums/images/album-123.jpg
 * // Returns: 200 OK with image file, or 404 Not Found if file doesn't exist
 * app.use(
 *   "/static/albums/images",
 *   wrapAsync(async (req, res, next) => {
 *     res.header(
 *       "Access-Control-Allow-Origin",
 *       process.env.ALLOWED_ORIGINS.split(",")
 *     );
 *     res.header("Cross-Origin-Resource-Policy", "cross-origin");
 *     next();
 *   }),
 *   express.static(path.join("uploads", "images", "albums"))
 * );
 */
app.use(
	"/static/albums/images",
	wrapAsync(async (req, res, next) => {
		res.header(
			"Access-Control-Allow-Origin",
			process.env.ALLOWED_ORIGINS.split(",")
		);
		res.header("Cross-Origin-Resource-Policy", "cross-origin");
		next();
	}),
	express.static(path.join("uploads", "images", "albums"))
);

/**
 * JSON body parser middleware.
 * Parses incoming request bodies as JSON, making them available
 * in req.body for route handlers.
 *
 * @example
 * // Example JSON request body:
 * // POST /api/album
 * // {
 * //   "name": "Amazing Grace Album",
 * //   "description": "A collection of hymns",
 * //   "songs": ["song-456", "song-789"]
 * // }
 * // Results in req.body containing the parsed JSON object
 * app.use(express.json());
 */
app.use(express.json());

/**
 * API routes middleware.
 * Mounts the apiRouter at the /api prefix, routing all API requests
 * to the appropriate sub-routers defined in routes/index.js.
 *
 * @example
 * // Example API request paths:
 * // GET /api/song - Handled by songRouter
 * // POST /api/user - Handled by userRouter
 * // PUT /api/album - Handled by albumRouter
 * // GET /api/logbook - Handled by logBookRouter
 * // DELETE /api/playlist - Handled by playlistRouter
 * app.use("/api", apiRouter);
 */
app.use("/api", apiRouter);

/**
 * Global error handling middleware.
 * Catches all errors thrown in previous middleware and route handlers.
 * Handles various error types and performs cleanup:
 * - File upload errors (MulterError with LIMIT_FILE_SIZE code)
 * - Server errors (500 status) with internal error logging
 * - Client errors (4xx status) with safe error messages
 * - Cleans up uploaded files on error by deleting temporary files
 * - Logs internal errors to request object while sending safe messages to clients
 *
 * Error handling flow:
 * 1. If request has uploaded file, attempt to delete it (errors logged to req.fileDeleteError)
 * 2. Extract error message and status code from error object
 * 3. Map Multer file size limit errors to 400 status
 * 4. For server errors (500), log internal error and send generic message
 * 5. For client errors (4xx), send specific error message
 * 6. Return JSON response with appropriate status code and message
 *
 * @param {Error} err - The error object containing message, statusCode, and internalError properties
 * @param {Request} req - Express request object for file cleanup and error logging
 * @param {Response} res - Express response object for sending error response
 * @param {NextFunction} _next - Express next function (unused in error middleware)
 * @throws {MulterError} If file upload limit exceeded, logs to req.fileDeleteError on cleanup failure
 * @returns {Promise<void>} Resolves after sending JSON error response
 * @example
 * // Example server error (500):
 * // Internal error logged to req.error.internalError
 * // Client receives: { message: "An unexpected error occurred." }
 * // HTTP status: 500
 *
 * // Example client error (400):
 * // Specific error message sent to client
 * // { message: "Invalid album name" }
 * // HTTP status: 400
 *
 * // Example file size limit error:
 * // MulterError with code "LIMIT_FILE_SIZE" triggers 400 status
 * // Uploaded file is deleted, client receives: { message: "File size exceeds limit" }
 * // HTTP status: 400
 */
app.use(async (err, req, res, _next) => {
	if (req.file)
		fs.unlink(req.file.path, (err) => {
			if (err) req.fileDeleteError = err;
		});
	let { message, statusCode = 500 } = err;
	if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE")
		statusCode = 400;
	if (statusCode === 500) {
		if (err.internalError) req.error = err.internalError;
		else req.error = err;
		message = "An unexpected error occurred.";
	}
	res.status(statusCode).json({ message });
});

/**
 * Database connection and server initialization.
 * Connects to MongoDB, initializes the default admin user,
 * and starts the Express server.
 *
 * Initialization sequence:
 * 1. Connect to MongoDB database using DB_URI from environment variables
 * 2. Initialize default admin user with credentials from environment variables
 * 3. Start Express server listening on configured port
 *
 * Environment variables required:
 * - DB_URI: MongoDB connection string
 * - DEFAULT_ADMIN_EMAIL: Email address for default admin user
 * - DEFAULT_ADMIN_NAME: Name for default admin user
 * - DEFAULT_ADMIN_PHOTO_LINK: URL to admin user's photo
 * - PORT: Server port number (default: 3000)
 *
 * @example
 * // Example initialization flow:
 * // 1. connect("mongodb://localhost:27017/songbook") -> Connected to MongoDB
 * // 2. initDb({ email: "admin@example.com", name: "Admin", photoLink: "..." })
 * // 3. app.listen(3000) -> Server started on port: 3000
 * //
 * // Console output:
 * // "Connected to MongoDB"
 * // "Server started on port: 3000"
 */
connect(process.env.DB_URI).then(async () => {
	console.log("Connected to MongoDB");
	await initDb({
		email: process.env.DEFAULT_ADMIN_EMAIL,
		name: process.env.DEFAULT_ADMIN_NAME,
		photoLink: process.env.DEFAULT_ADMIN_PHOTO_LINK,
	});
	app.listen(process.env.PORT, () =>
		console.log("Server started on port: ", process.env.PORT)
	);
});

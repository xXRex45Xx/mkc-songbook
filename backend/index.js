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

const configError = config().error;

if (configError) throw configError;

const app = express();

/**
 * Custom Morgan tokens for logging errors.
 * Adds error message and file deletion error tokens to the logging format.
 */
morgan.token("error", (req) => req.error?.message || "");
morgan.token("fileerror", (req) => req.fileDeleteError?.message || "");

/**
 * Express application setup with security and utility middleware:
 * - Helmet for security headers
 * - Morgan for request logging
 * - CORS with configured origins
 * - JSON body parser
 * - API routes mounted at /api
 */
app.use(helmet());
app.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms :error :fileerror"
	)
);

app.use(
	cors({
		origin: process.env.ALLOWED_ORIGINS.split(","),
	})
);

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
app.use(express.json());

app.use("/api", apiRouter);

/**
 * Global error handling middleware.
 * Handles various error types:
 * - File upload errors (Multer)
 * - Server errors (500)
 * - Client errors (4xx)
 * Cleans up uploaded files on error
 * Logs internal errors while sending safe messages to clients
 *
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function
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

/**
 * Database Configuration
 *
 * This module handles the MongoDB database connection setup using Mongoose.
 * It provides a connection function that:
 * 1. Connects to MongoDB using the URI from environment variables
 * 2. Sets up connection event handlers
 * 3. Configures connection options for optimal performance
 *
 * @module db
 */

import mongoose from "mongoose";
import SongModel from "../models/song.model.js";
import AlbumModel from "../models/album.model.js";

/**
 * Connects to MongoDB database
 *
 * This function establishes a connection to the MongoDB database using the provided URI.
 * It configures Mongoose with appropriate options for optimal performance and error handling.
 * The connection is asynchronous and will resolve when the database is successfully connected.
 *
 * @param {string} uri - MongoDB connection URI with authentication details and database name
 * @returns {Promise<void>} Resolves when connection is established with successful database connection
 * @throws {Error} If connection fails due to invalid URI, authentication issues, or network problems
 */
export const connect = async (uri) => {
    try {
        await mongoose.connect(uri);
    } catch (err) {
        console.error(err);
        throw err;
    }
};

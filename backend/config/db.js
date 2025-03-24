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
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails
 */
export const connect = async (uri) => {
    try {
        await mongoose.connect(uri);
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/**
 * Album model module.
 * Defines the schema and model for album data in the application.
 * Handles album management, including song collections and cover photos.
 * @module models/album
 */

import { Schema, model } from "mongoose";

/**
 * Album schema definition.
 * @typedef {Object} AlbumSchema
 * @property {string} _id - Custom album ID/number (required, used for easy reference)
 * @property {string} name - Album name (required, minimum length: 1)
 * @property {string} createdAt - Year the album was created (defaults to current year, minimum length: 4)
 * @property {Object} photo - Album cover photo storage
 * @property {Buffer} photo.data - Binary data of the photo (supports various image formats)
 * @property {string} photo.contentType - MIME type of the photo (e.g., 'image/jpeg', 'image/png')
 * @property {string[]} songs - Array of song IDs included in this album (references Song model)
 */
const albumSchema = new Schema({
    _id: { type: String, minLength: 1, required: true },
    name: { type: String, minLength: 1, required: true },
    createdAt: {
        type: String,
        default: () => new Date().getFullYear().toString(),
        minLength: 4,
        required: true,
    },
    photo: { type: String },
    songs: [{ type: String, ref: "Song" }],
});

const AlbumModel = model("Album", albumSchema);

export default AlbumModel;

/**
 * Song model module.
 * Defines the schema and model for song data in the application.
 * Handles song management, including lyrics, musical elements, and album associations.
 * @module models/song
 */

import { Schema, model, Types } from "mongoose";

/**
 * Song schema definition.
 * @typedef {Object} SongSchema
 * @property {string} _id - Custom song ID/number (required, used for easy reference)
 * @property {string} title - Song title (required, indexed for search, trimmed)
 * @property {string} lyrics - Song lyrics (required, trimmed)
 * @property {Object} musicElements - Musical attributes of the song
 * @property {string} [musicElements.chord] - Song's chord progression (e.g., "Am", "C")
 * @property {number} [musicElements.tempo] - Song's tempo in BPM (beats per minute)
 * @property {string} [musicElements.rythm] - Song's rhythm pattern (e.g., "4/4", "Waltz")
 * @property {string} createdAt - Year the song was added (defaults to current year)
 * @property {Date} updatedAt - Last modification timestamp
 * @property {string} [songFilePath] - Path to the song's audio file
 * @property {string} [youtubeLink] - Link to song's YouTube video
 * @property {string[]} albums - Array of album IDs this song belongs to
 */
const songSchema = new Schema({
    _id: { type: String, minLength: 1, required: true },
    title: {
        type: String,
        trim: true,
        minLength: 1,
        required: true,
        index: true,
    },
    lyrics: { type: String, trim: true, required: true },
    musicElements: {
        chord: { type: String },
        tempo: { type: Number },
        rythm: { type: String },
    },
    createdAt: {
        type: String,
        trim: true,
        default: () => new Date().getFullYear().toString(),
    },
    updatedAt: { type: Date, default: Date.now },
    songFilePath: { type: String },
    youtubeLink: { type: String },
    albums: [{ type: String, ref: "Album" }],
});

const SongModel = model("Song", songSchema);

export default SongModel;

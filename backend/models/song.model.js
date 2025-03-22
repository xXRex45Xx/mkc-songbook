import { Schema, model, Types } from "mongoose";

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

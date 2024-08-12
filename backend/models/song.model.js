import { Schema, model } from "mongoose";

const songSchema = new Schema({
    _id: { type: Number, required: true },
    title: { type: String, required: true, index: true, unique: true },
    lyrics: { type: String, required: true },
    musicElements: {
        chords: { type: String },
        tempo: { type: Number },
        rythm: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const SongModel = model("Song", songSchema);

export default SongModel;

import { Schema, model, Types } from "mongoose";

const songSchema = new Schema({
    _id: { type: Number, required: true },
    title: { type: String, required: true, index: true },
    lyrics: { type: String, required: true },
    musicElements: {
        chord: { type: String },
        tempo: { type: Number },
        rythm: { type: String },
    },
    createdAt: {
        type: String,
        default: () => new Date().getFullYear().toString(),
    },
    updatedAt: { type: Date, default: Date.now },
    mediaFiles: [{ type: Types.ObjectId, ref: "MediaFile" }],
    albums: [{ type: String, ref: "Album" }],
});

const SongModel = model("Song", songSchema);

export default SongModel;

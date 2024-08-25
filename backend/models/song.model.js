import { Schema, model, Types } from "mongoose";

const songSchema = new Schema({
    _id: { type: Number, required: true },
    title: { type: String, required: true, index: true, unique: true },
    lyrics: { type: String, required: true },
    musicElements: {
        chord: { type: String },
        tempo: { type: Number },
        rythm: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    mediaFiles: [{ type: Types.ObjectId, ref: "MediaFile" }],
});

const SongModel = model("Song", songSchema);

export default SongModel;

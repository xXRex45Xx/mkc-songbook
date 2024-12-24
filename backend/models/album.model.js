import { Schema, model } from "mongoose";

const albumSchema = new Schema({
    _id: { type: String, minLength: 1, required: true },
    name: { type: String, minLength: 1, required: true },
    volume: { type: String, minLength: 1, required: true },
    createdAt: {
        type: String,
        default: () => new Date().getFullYear().toString(),
        minLength: 4,
        required: true,
    },
    photo: { data: Buffer, contentType: String },
    songs: [{ type: String, ref: "Song" }],
});

const AlbumModel = model("Album", albumSchema);

export default AlbumModel;

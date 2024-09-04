import { Schema, model, Types } from "mongoose";

const albumSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    volume: { type: String, required: true },
    year: { type: String, required: true },
    photo: { data: Buffer, contentType: String },
    songs: [{ type: Number, ref: "Song" }],
});

const AlbumModel = model("Album", albumSchema);

export default AlbumModel;

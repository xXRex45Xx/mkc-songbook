import { Schema, model, Types } from "mongoose";

const albumSchema = new Schema({
    name: { type: String, required: true },
    volume: { type: String, required: true },
    year: { type: String, required: true },
    photo: { data: Buffer, contentType: String },
    songs: [{ type: Types.ObjectId, ref: "Song" }],
});

const AlbumModel = model("Album", albumSchema);

export default AlbumModel;

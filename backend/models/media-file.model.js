import { Schema, model } from "mongoose";

const mediaFileSchema = new Schema({
    songId: { type: Number, required: true, ref: "Song", index: true },
    fileType: { type: String, enum: ["Audio", "Video"] },
    filePath: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const MediaFileModel = model("MediaFile", mediaFileSchema);

export default MediaFileModel;

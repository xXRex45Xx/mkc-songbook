import { Schema, model } from "mongoose";

const logBookSchema = Schema({
    churchName: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    songList: [{ type: Number, required: true, ref: "Song" }],
});

const LogBookModel = model("LogBook", logBookSchema);

export default LogBookModel;

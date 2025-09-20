import { model, Schema, Types } from "mongoose";

const playlistSchema = new Schema({
	name: {
		type: String,
		trim: true,
		minLength: 1,
		required: true,
		index: true,
	},
	visibility: {
		type: String,
		enum: ["private", "members", "public"],
		default: "private",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	creator: { type: Types.ObjectId, required: true, index: true, ref: "User" },
	songs: [{ type: String, ref: "Song" }],
});

const PlaylistModel = model("Playlist", playlistSchema);

export default PlaylistModel;

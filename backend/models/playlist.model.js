import { model, Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minLength: 1,
        required: true,
        index: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    updatedAt : {
        type: Date, 
        default: Date.now
    },
    songs: [{type: String, ref: "Song"}]
})

const PlaylistModel = model("Playlist", playlistSchema);

export default PlaylistModel;
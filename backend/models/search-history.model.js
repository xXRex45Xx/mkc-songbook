import { Schema, model, Types } from "mongoose";

const searchHistorySchema = new Schema({
    userId: { type: Types.ObjectId, required: true, index: true, ref: "User" },
    searchTerm: { type: String, required: true },
    resultCount: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const SearchHistoryModel = model("SearchHistory", searchHistorySchema);

export default SearchHistoryModel;

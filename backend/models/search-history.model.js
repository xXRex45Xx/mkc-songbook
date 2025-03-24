/**
 * Search History model module.
 * Defines the schema and model for tracking user search history.
 * Used for analytics and improving search functionality.
 * @module models/search-history
 */

import { Schema, model, Types } from "mongoose";

/**
 * Search History schema definition.
 * @typedef {Object} SearchHistorySchema
 * @property {Types.ObjectId} userId - Reference to the user who performed the search (indexed for performance)
 * @property {string} searchTerm - The term or query used in the search
 * @property {number} resultCount - Number of results found for the search
 * @property {Date} timestamp - When the search was performed (defaults to current time)
 */
const searchHistorySchema = new Schema({
    userId: { type: Types.ObjectId, required: true, index: true, ref: "User" },
    searchTerm: { type: String, required: true },
    resultCount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

const SearchHistoryModel = model("SearchHistory", searchHistorySchema);

export default SearchHistoryModel;

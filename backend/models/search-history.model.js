/**
 * Search History Model - Database schema for tracking user search history
 *
 * This model defines the structure and validation rules for search history in the database.
 * It includes relationships with users, search terms, result counts, and timestamps for analytics.
 * The model supports tracking search behavior and improving search functionality while maintaining
 * data integrity and performance characteristics.
 *
 * @module models/search-history
 *
 * @property {string} _id - Unique identifier for search history entry with explanation of automatic generation and UUID format
 * @property {Types.ObjectId} userId - Reference to the user who performed the search (required, indexed) with explanation of relationship mapping and constraint validation
 * @property {string} searchTerm - The term or query used in the search (required) with description of content constraints, character limits, and validation rules
 * @property {number} resultCount - Number of results found for the search (required) with explanation of how it's used for analytics and search improvement
 * @property {Date} timestamp - When the search was performed (defaults to current time) with detailed explanation of timestamp handling and timezone considerations
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
import { Schema, model, Types } from "mongoose";

/**
 * Search History schema definition.
 *
 * This schema defines the structure for search history data including user reference,
 * search term, result count, and timestamp. It includes validation rules to ensure
 * proper data handling for analytics purposes.
 *
 * @typedef {Object} SearchHistorySchema
 * @property {string} _id - Unique identifier for search history entry with explanation of automatic generation and UUID format
 * @property {Types.ObjectId} userId - Reference to the user who performed the search (required, indexed) with explanation of relationship mapping and constraint validation
 * @property {string} searchTerm - The term or query used in the search (required) with description of content constraints, character limits, and validation rules
 * @property {number} resultCount - Number of results found for the search (required) with explanation of how it's used for analytics and search improvement
 * @property {Date} timestamp - When the search was performed (defaults to current time) with detailed explanation of timestamp handling and timezone considerations
 */
const searchHistorySchema = new Schema({
	userId: { type: Types.ObjectId, required: true, index: true, ref: "User" },
	searchTerm: { type: String, required: true },
	resultCount: { type: Number, required: true },
	timestamp: { type: Date, default: Date.now },
});

const SearchHistoryModel = model("SearchHistory", searchHistorySchema);

export default SearchHistoryModel;
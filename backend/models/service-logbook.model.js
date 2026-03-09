/**
 * Service Logbook Model - Database schema for tracking church service song lists
 *
 * This model defines the structure and validation rules for service logbooks in the database.
 * It includes relationships with churches, dates, and song lists for tracking services.
 * The model supports maintaining records of church services and associated songs while maintaining
 * data integrity and consistency.
 *
 * @module models/service-logbook
 *
 * @property {string} _id - Unique identifier for logbook entry with explanation of automatic generation and UUID format
 * @property {string} churchName - Name of the church where service was held (required) with description of content constraints, character limits, and validation rules
 * @property {Date} serviceDate - Date when the service took place (required) with detailed explanation of date handling and timezone considerations
 * @property {string[]} songList - Array of song IDs used in the service (required) with explanation of relationship mapping and constraint validation
 * @property {boolean} cancelled - Flag indicating if service was cancelled (defaults to false) with explanation of how this flag is used for record management
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
import { Schema, model } from "mongoose";

/**
 * Service Logbook schema definition.
 *
 * This schema defines the structure for service logbook data including church name,
 * service date, song list, cancellation status, and timestamps. It includes validation rules
 * to ensure proper data handling for tracking church services.
 *
 * @typedef {Object} LogBookSchema
 * @property {string} _id - Unique identifier for logbook entry with explanation of automatic generation and UUID format
 * @property {string} churchName - Name of the church where service was held (required) with description of content constraints, character limits, and validation rules
 * @property {Date} serviceDate - Date when the service took place (required) with detailed explanation of date handling and timezone considerations
 * @property {string[]} songList - Array of song IDs used in the service (required) with explanation of relationship mapping and constraint validation
 * @property {boolean} cancelled - Flag indicating if service was cancelled (defaults to false) with explanation of how this flag is used for record management
 * @property {Date} createdAt - Timestamp when created with details about timezone handling and automatic generation
 * @property {Date} updatedAt - Timestamp when last updated with explanation of modification tracking and update behavior
 */
const logBookSchema = new Schema({
	churchName: { type: String, required: true },
	serviceDate: { type: Date, required: true },
	songList: [{ type: String, required: true, ref: "Song" }],
	updatedAt: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now },
	cancelled: { type: Boolean, default: false },
});

const LogBookModel = model("LogBook", logBookSchema);

export default LogBookModel;
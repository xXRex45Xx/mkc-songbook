/**
 * Service Logbook model module.
 * Defines the schema and model for tracking church service song lists.
 * @module models/service-logbook
 */

import { Schema, model } from "mongoose";

/**
 * Service Logbook schema definition.
 * @typedef {Object} LogBookSchema
 * @property {string} churchName - Name of the church where service was held
 * @property {Date} serviceDate - Date when the service took place
 * @property {string[]} songList - Array of song IDs used in the service
 */
const logBookSchema = Schema({
	churchName: { type: String, required: true },
	serviceDate: { type: Date, required: true },
	songList: [{ type: String, required: true, ref: "Song" }],
	updatedAt: { type: Date, default: Date.now },
	cancelled: { type: Boolean, default: false },
});

const LogBookModel = model("LogBook", logBookSchema);

export default LogBookModel;

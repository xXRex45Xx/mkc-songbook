import backendURL from "../../config/backend-url.config";

/**
 * @fileoverview Logbook API utility functions
 * Contains functions for interacting with the logbook endpoints
 */

/**
 * Fetches all logbook entries with pagination
 * Marks recently added/changed entries based on timestamps
 * @param {number} page - Page number for pagination
 * @param {string} token - Authentication token (defaults to token in localStorage)
 * @returns {Promise<Object>} Logbook data with enhanced timestamp info
 * @throws {Object} Error with message and status if request fails
 */
export const getAllOrSearchLogBook = async (
	page = 1,
	token = localStorage.getItem("_s")
) => {
	const response = await fetch(`${backendURL}/api/logbook?page=${page}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const data = await response.json();

	if (!response.ok) throw { message: data.message, status: response.status };
	const twoDaysInMS = 48 * 60 * 60 * 1000;
	data.logBook = data.logBook.map((log) => {
		log.createdAt = new Date(log.createdAt);
		log.serviceDate = new Date(log.serviceDate);
		log.updatedAt = new Date(log.updatedAt);
		const createdAtOffset = Math.abs(new Date() - log.createdAt);
		const updatedAtOffset = Math.abs(new Date() - log.updatedAt);
		const timestampDiffs = log.createdAt - log.updatedAt;
		if (
			(timestampDiffs > 0 && createdAtOffset < twoDaysInMS) ||
			(timestampDiffs === 0 && createdAtOffset < twoDaysInMS)
		)
			log.recentlyAdded = true;
		else if (timestampDiffs < 0 && updatedAtOffset < twoDaysInMS)
			log.recentlyChanged = true;
		return log;
	});

	return data;
};

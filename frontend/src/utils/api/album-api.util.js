/**
 * @fileoverview Album API utility functions
 * Contains functions for interacting with the album endpoints
 */

import backendURL from "../../config/backend-url.config";
import { sendMutation } from "../pwa/write-queue.util";

/**
 * Fetches all albums from the backend
 * @param {boolean} namesOnly - If true, fetches only album names
 * @param {Object|null} searchQuery - Search parameters
 * @param {string} [searchQuery.q] - Search query string
 * @returns {Promise<Object>} Album data from the server
 * @throws {Object} Error with message and status if request fails
 */
export const getAllAlbums = async (namesOnly = false, searchQuery = null) => {
	const params = new URLSearchParams();
	if (namesOnly) params.append("names", "true");
	if (searchQuery?.q) params.append("q", searchQuery.q);
	const query = params.toString();

	const response = await fetch(
		`${backendURL}/api/album${query ? `?${query}` : ""}`
	);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };
	return data;
};

/**
 * Creates or updates an album
 * @param {FormData} formData - Form data containing album details
 * @param {boolean} edit - If true, updates existing album; if false, creates new album
 * @param {string|null} albumId - ID of album to edit (required if edit is true)
 * @returns {Promise<Object>} Created or updated album data
 * @throws {Object} Validation errors or server error response
 */
export const addOrEditAlbum = async (
	formData,
	edit = false,
	albumId = null
) => {
	const error = { status: 400 };
	let errorOccured = false;

	if (!formData.get("id") || formData.get("id").trim().length === 0) {
		errorOccured = true;
		error.idMessage = "Album number is required.";
	}

	if (!formData.get("title") || formData.get("title").trim().length === 0) {
		errorOccured = true;
		error.titleMessage = "Title is required.";
	}

	if (
		formData.get("playlist-link") &&
		!(
			formData.get("playlist-link").includes("youtu.be") ||
			formData.get("playlist-link").includes("youtube.com")
		)
	) {
		errorOccured = true;
		error.playlistLinkMessage = "Please enter a valid youtube link.";
	}
	if (formData.getAll("songs").length === 0) {
		errorOccured = true;
		error.trackMessage =
			"An empty album is not allowed. Please add one or more tracks.";
	}

	if (errorOccured) throw error;

	const data = await sendMutation({
		url: `${backendURL}/api/album${edit ? "/" + albumId : ""}`,
		method: edit ? "PUT" : "POST",
		body: formData,
		label: edit ? `Update album ${albumId}` : `Add album ${formData.get("id")}`,
	});

	return data;
};

/**
 * Fetches a single album by ID
 * @param {string} id - Album ID to fetch
 * @returns {Promise<Object>} Album data
 * @throws {Object} Error with message and status if request fails
 */
export const getAlbum = async (id) => {
	if (id.length === 0)
		throw { message: "Album number is required.", status: 400 };
	const response = await fetch(`${backendURL}/api/album/${id}`);
	const data = await response.json();

	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};

/**
 * Fetches albums updated since a given timestamp for delta sync
 * @param {string} timestamp - ISO date string for syncSince filter
 * @returns {Promise<Array>} Updated albums data from the server
 * @throws {Object} Error with message and status if request fails
 */
export const getAlbumsSince = async (timestamp) => {
	const response = await fetch(
		`${backendURL}/api/album?syncSince=${encodeURIComponent(timestamp)}`
	);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };
	return data;
};

/**
 * Fetches the IDs of every album on the server
 *
 * Used to reconcile local deletions, which delta sync cannot detect: a
 * deleted album never reappears in the `syncSince` window.
 *
 * @returns {Promise<string[]>} All album IDs known to the server
 * @throws {Object} Error with message and status if request fails
 */
export const getAllAlbumIds = async () => {
	const response = await fetch(`${backendURL}/api/album?idsOnly=true`);
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };
	return data.albumIds || [];
};

/**
 * Deletes an album by ID
 * @param {string} id - ID of album to delete
 * @returns {Promise<void>}
 * @throws {Object} Error with message and status if deletion fails
 */
export const deleteAlbum = async (id) => {
	if (id.length === 0)
		throw { message: "Album number is required.", status: 400 };
	const data = await sendMutation({
		url: `${backendURL}/api/album/${id}`,
		method: "DELETE",
		label: `Delete album ${id}`,
	});

	if (data?.queued) return;
	if (!data?.deleted)
		throw { message: "An unexpected error occurred.", status: 500 };
};

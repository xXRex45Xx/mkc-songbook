import backendURL from "../../config/backend-url.config";
import { sendMutation } from "../pwa/write-queue.util";
import { apiFetch } from "./api-client.util";

/**
 * @fileoverview Playlist API utility functions
 * Contains functions for interacting with the playlist endpoints
 */

/**
 * Fetches all playlists with pagination and search
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search query string
 * @param {number} page - Page number for pagination
 * @param {boolean} myPlaylists - If true, fetches only user's playlists
 * @returns {Promise<Object>} Playlist data from the server
 * @throws {Object} Error with message and status if request fails
 */
export const getAllPlaylists = async (
	searchQuery = null,
	page = 1,
	myPlaylists = false
) => {
	let response;
	if (myPlaylists)
		response = await apiFetch(`${backendURL}/api/playlist?myPlaylists=true`);
	else {
		const params = new URLSearchParams();
		params.set("page", String(page));
		if (searchQuery?.q) params.set("q", searchQuery.q);

		// Signed-in users also see their own private playlists in the list.
		response = await apiFetch(`${backendURL}/api/playlist?${params.toString()}`);
	}
	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };
	return data;
};

/**
 * Creates or updates a playlist
 * @param {FormData} formData - Form data containing playlist details
 * @param {boolean} edit - If true, updates existing playlist; if false, creates new playlist
 * @param {string|null} playlistId - ID of playlist to edit (required if edit is true)
 * @param {Object} [options] - Send options
 * @param {boolean} [options.queue=true] - When false, a missing network throws instead of queueing the request
 * @returns {Promise<Object>} Created or updated playlist data
 * @throws {Object} Validation errors or server error response
 */
export const addOrEditPlaylist = async (
	formData,
	edit = false,
	playlistId = null,
	{ queue = true } = {}
) => {
	const error = { status: 400 };
	let errorOccured = false;

	if (!formData.get("name") || formData.get("name").trim().length === 0) {
		errorOccured = true;
		error.nameMessage = "Name is required.";
	}

	if (errorOccured) throw error;

	const data = await sendMutation({
		url: `${backendURL}/api/playlist${edit ? "/" + playlistId : ""}`,
		method: edit ? "PUT" : "POST",
		body: JSON.stringify({
			name: formData.get("name"),
			visibility: formData.get("visibility"),
			songs: formData.getAll("songs"),
		}),
		headers: { "Content-Type": "application/json" },
		label: edit ? `Update playlist ${playlistId}` : "Create playlist",
		queueable: queue,
	});

	return data;
};

/**
 * Updates playlist visibility or manages song additions/removals
 * @param {string} playlistId - ID of playlist to update
 * @param {string} [visibility] - New visibility setting
 * @param {string[]} [addSongs] - Array of song IDs to add
 * @param {string|string[]} [removeSongs] - Song ID(s) to remove
 * @returns {Promise<void>}
 * @throws {Object} Validation errors or server error response
 */
export const patchPlaylist = async (
	playlistId,
	visibility,
	addSongs = null,
	removeSongs = null
) => {
	if (!visibility && !addSongs && !removeSongs)
		throw { message: "Invalid request.", status: 400 };
	if (typeof removeSongs === "string") removeSongs = [removeSongs];
	const data = await sendMutation({
		url: `${backendURL}/api/playlist/${playlistId}`,
		method: "PATCH",
		body: JSON.stringify({
			visibility: visibility ? visibility : undefined,
			addSongs: addSongs ? addSongs : undefined,
			removeSongs: removeSongs ? removeSongs : undefined,
		}),
		headers: { "Content-Type": "application/json" },
		label: `Update playlist ${playlistId}`,
	});

	if (data?.queued) return;
	if (!data?.updated) throw { message: "An unexpected error occurred." };
};

/**
 * Fetches a single playlist by ID
 * @param {string} id - Playlist ID to fetch
 * @returns {Promise<Object>} Playlist data
 * @throws {Object} Error with message and status if request fails
 */
export const getPlaylist = async (id) => {
	if (id.length === 0)
		throw new { message: "Playlist id is required.", status: 4000 }();
	const response = await apiFetch(`${backendURL}/api/playlist/${id}`);

	const data = await response.json();
	if (!response.ok) throw { message: data.message, status: response.status };

	return data;
};

/**
 * Deletes a playlist by ID
 * @param {string} id - Playlist ID to delete
 * @returns {Promise<void>}
 * @throws {Object} Error with message and status if deletion fails
 */
export const deletePlaylist = async (id) => {
	if (id.length === 0)
		throw { message: "Playlist id is required.", status: 400 };
	const data = await sendMutation({
		url: `${backendURL}/api/playlist/${id}`,
		method: "DELETE",
		label: `Delete playlist ${id}`,
	});

	if (data?.queued) return;
	if (!data?.deleted)
		throw { message: "An unexpected error occurred.", status: 500 };
};

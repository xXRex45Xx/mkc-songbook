/**
 * @fileoverview Album API utility functions
 * Contains functions for interacting with the album endpoints
 */

import backendURL from "../../config/backend-url.config";

/**
 * Fetches all albums from the backend
 * @param {boolean} namesOnly - If true, fetches only album names
 * @returns {Promise<Object>} Album data from the server
 * @throws {Object} Error with message and status if request fails
 */
export const getAllAlbums = async (namesOnly = false) => {
    const response = await fetch(
        `${backendURL}/api/album${namesOnly ? "?names=true" : ""}`
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
 * @param {string} token - Authentication token (defaults to token in localStorage)
 * @returns {Promise<Object>} Created or updated album data
 * @throws {Object} Validation errors or server error response
 */
export const addOrEditAlbum = async (
    formData,
    edit = false,
    albumId = null,
    token = localStorage.getItem("_s")
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

    const response = await fetch(
        `${backendURL}/api/album${edit ? "/" + albumId : ""}`,
        {
            method: edit ? "PUT" : "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const data = await response.json();
    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

export const getAlbum = async (id) => {
    if (id.length === 0)
        throw { message: "Album number is required.", status: 400 };
    const response = await fetch(`${backendURL}/api/album/${id}`);
    const data = await response.json();

    if (!response.ok) throw { message: data.message, status: response.status };

    return data;
};

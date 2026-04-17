/**
 * @fileoverview Local playlist API utility
 * Provides functions for managing playlists stored in IndexedDB
 * Acts as a business logic layer on top of the IndexedDB service
 */

import { playlistIdbService } from "../db/playlist-idb-service.util";
import { addOrEditPlaylist } from "./playlist-api.util";

/**
 * Retrieves all local playlists from IndexedDB
 *
 * @returns {Promise<Array>} Array of local playlist objects
 * @throws {Error} If database operation fails
 * @example
 * ```javascript
 * const playlists = await getAllLocalPlaylists();
 * ```
 */
export const getAllLocalPlaylists = async () => {
  return playlistIdbService.getAll();
};

/**
 * Retrieves a single local playlist by ID
 *
 * @param {string} id - Local playlist ID
 * @returns {Promise<Object|null>} Playlist object or null
 * @throws {Error} If database operation fails
 * @example
 * ```javascript
 * const playlist = await getLocalPlaylist('local_123');
 * ```
 */
export const getLocalPlaylist = async (id) => {
  return playlistIdbService.getById(id);
};

/**
 * Creates a new local playlist
 *
 * @param {Object} data - Playlist data
 * @param {string} data.name - Playlist name
 * @param {Array} data.songs - Array of song objects
 * @returns {Promise<string>} Created playlist ID
 * @throws {Error} 400: If name is empty or whitespace only
 * @example
 * ```javascript
 * const id = await createLocalPlaylist({ name: 'My Playlist', songs: [] });
 * ```
 */
export const createLocalPlaylist = async ({ name, songs }) => {
  if (!name || name.trim().length === 0) {
    throw { message: "Playlist name is required.", status: 400 };
  }
  return playlistIdbService.create({ name: name.trim(), songs: songs || [] });
};

/**
 * Updates an existing local playlist
 *
 * @param {string} id - Local playlist ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - New playlist name
 * @param {Array} [updates.songs] - New songs array
 * @returns {Promise<void>}
 * @throws {Error} 400: If name is empty string
 * @throws {Error} If playlist not found
 * @example
 * ```javascript
 * await updateLocalPlaylist('local_123', { name: 'Updated' });
 * ```
 */
export const updateLocalPlaylist = async (id, { name, songs }) => {
  if (name !== undefined && name.trim().length === 0) {
    throw { message: "Playlist name cannot be empty.", status: 400 };
  }
  return playlistIdbService.update(id, { name: name?.trim(), songs });
};

/**
 * Deletes a local playlist
 *
 * @param {string} id - Local playlist ID
 * @returns {Promise<void>}
 * @throws {Error} If database operation fails
 * @example
 * ```javascript
 * await deleteLocalPlaylist('local_123');
 * ```
 */
export const deleteLocalPlaylist = async (id) => {
  return playlistIdbService.delete(id);
};

/**
 * Retrieves all unsynced playlists (local only, not uploaded to server)
 *
 * @returns {Promise<Array>} Array of unsynced playlist objects
 * @throws {Error} If database operation fails
 * @example
 * ```javascript
 * const unsynced = await getUnsyncedPlaylists();
 * ```
 */
export const getUnsyncedPlaylists = async () => {
  return playlistIdbService.getUnsynced();
};

/**
 * Adds a song to a local playlist
 *
 * @param {string} playlistId - Local playlist ID
 * @param {Object} song - Song object to add
 * @returns {Promise<void>}
 * @throws {Error} 404: If playlist not found
 * @throws {Error} 400: If song already in playlist
 * @example
 * ```javascript
 * await addSongToLocalPlaylist('local_123', { _id: 'song1', title: 'Great Song' });
 * ```
 */
export const addSongToLocalPlaylist = async (playlistId, song) => {
  const playlist = await playlistIdbService.getById(playlistId);
  if (!playlist) throw { message: "Playlist not found.", status: 404 };

  const songExists = playlist.songs.some((s) => s._id === song._id);
  if (songExists) {
    throw { message: "Song is already in the playlist.", status: 400 };
  }

  const updatedSongs = [...playlist.songs, song];
  return playlistIdbService.update(playlistId, { songs: updatedSongs });
};

/**
 * Removes a song from a local playlist
 *
 * @param {string} playlistId - Local playlist ID
 * @param {string} songId - Song ID to remove
 * @returns {Promise<void>}
 * @throws {Error} 404: If playlist not found
 * @example
 * ```javascript
 * await removeSongFromLocalPlaylist('local_123', 'song1');
 * ```
 */
export const removeSongFromLocalPlaylist = async (playlistId, songId) => {
  const playlist = await playlistIdbService.getById(playlistId);
  if (!playlist) throw { message: "Playlist not found.", status: 404 };

  const updatedSongs = playlist.songs.filter((s) => s._id !== songId);
  return playlistIdbService.update(playlistId, { songs: updatedSongs });
};

/**
 * Uploads a local playlist to the server
 * After successful upload, marks the playlist as synced
 *
 * @param {string} id - Local playlist ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Server response with insertedId
 * @throws {Error} 404: If playlist not found
 * @throws {Error} 401: If not authenticated
 * @throws {Error} 500: If server upload fails
 * @example
 * ```javascript
 * const result = await syncPlaylistToServer('local_123', token);
 * console.log('Uploaded:', result.insertedId);
 * ```
 */
export const syncPlaylistToServer = async (id, token) => {
  const playlist = await playlistIdbService.getById(id);
  if (!playlist) throw { message: "Playlist not found.", status: 404 };

  const formData = new FormData();
  formData.append("name", playlist.name);
  formData.append("visibility", "private");
  playlist.songs.forEach((song) => formData.append("songs", song._id));

  const result = await addOrEditPlaylist(formData, false, null, token);

  if (result.insertedId) {
    await playlistIdbService.markSynced(id, result.insertedId);
  }

  return result;
};

/**
 * Uploads all unsynced local playlists to the server
 *
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} Array of results for each sync
 * @throws {Error} 401: If not authenticated
 * @example
 * ```javascript
 * const results = await syncAllUnsyncedPlaylists(token);
 * console.log('Uploaded:', results.filter(r => r.success).length);
 * ```
 */
export const syncAllUnsyncedPlaylists = async (token) => {
  const unsynced = await playlistIdbService.getUnsynced();
  const results = [];

  for (const playlist of unsynced) {
    try {
      const result = await syncPlaylistToServer(playlist.id, token);
      results.push({ id: playlist.id, success: true, insertedId: result.insertedId });
    } catch (error) {
      results.push({ id: playlist.id, success: false, error: error.message });
    }
  }

  return results;
};

export default {
  getAllLocalPlaylists,
  getLocalPlaylist,
  createLocalPlaylist,
  updateLocalPlaylist,
  deleteLocalPlaylist,
  getUnsyncedPlaylists,
  addSongToLocalPlaylist,
  removeSongFromLocalPlaylist,
  syncPlaylistToServer,
  syncAllUnsyncedPlaylists,
};

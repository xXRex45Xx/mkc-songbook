/**
 * @fileoverview Audio download utility
 * Provides the single save-and-download entry point for the download button,
 * plus read helpers for the offline audio player.
 */

import backendURL from "../../config/backend-url.config";
import { audioIdbService } from "../db/audio-idb-service.util";
import { songIdbService } from "../db/song-idb-service.util";

/**
 * Fetches a song's audio as a Blob
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<{blob: Blob, mimeType: string}>} Audio bytes and content type
 * @throws {Error} If the request fails
 * @private
 */
const fetchAudioBlob = async (songId) => {
	const response = await fetch(`${backendURL}/api/song/${songId}/audio`);
	if (!response.ok) throw new Error("Failed to fetch audio file");
	const blob = await response.blob();
	return {
		blob,
		mimeType: blob.type || response.headers.get("content-type") || "",
	};
};

/**
 * Reads the song record's remote updatedAt at save time so staleness can be
 * checked against the song record later.
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<string>} Remote updatedAt, or "" when it cannot be read
 * @private
 */
const lookupRemoteUpdatedAt = async (songId) => {
	try {
		const song = await songIdbService.getById(songId);
		return song?.updatedAt || "";
	} catch (err) {
		console.warn("Could not look up song updatedAt for audio cache:", err);
		return "";
	}
};

/**
 * Writes a Blob to the device. Uses the File System Access API
 * (showSaveFilePicker) when available, falls back to blob URL + anchor click.
 *
 * Resolves "aborted" when the user dismisses the save dialog; the caller keeps
 * the offline copy in that case.
 *
 * @param {Blob} blob - Audio bytes to write
 * @param {string} songTitle - Song title used for the filename
 * @returns {Promise<"saved"|"aborted"|"fallback">} Outcome of the device write
 * @throws {Error} If the fallback write cannot be initiated
 * @private
 */
const saveBlobToDevice = async (blob, songTitle) => {
	if (window.showSaveFilePicker) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: `${songTitle}.mp3`,
				types: [
					{
						description: "Audio File",
						accept: { "audio/mpeg": [".mp3"] },
					},
				],
			});
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return "saved";
		} catch (err) {
			if (err.name === "AbortError") return "aborted";
		}
	}

	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${songTitle}.mp3`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	return "fallback";
};

/**
 * Saves a song's audio for offline playback and downloads it to the device.
 *
 * Single entry point for the download button: one fetch serves both outcomes.
 * The IndexedDB copy is written first, so in-app offline playback survives even
 * when the user dismisses the device save dialog.
 *
 * @param {string} songId - Song identifier
 * @param {string} songTitle - Song title used for the downloaded filename
 * @returns {Promise<{device: "saved"|"aborted"|"fallback"}>} Device write outcome
 * @throws {Error} If the fetch or the IndexedDB write fails
 * @example
 * ```javascript
 * const { device } = await saveAndDownloadAudio(song._id, song.title);
 * ```
 */
export const saveAndDownloadAudio = async (songId, songTitle) => {
	const { blob, mimeType } = await fetchAudioBlob(songId);
	const remoteUpdatedAt = await lookupRemoteUpdatedAt(songId);

	await audioIdbService.store(songId, {
		_id: songId,
		songId,
		blob,
		updatedAt: remoteUpdatedAt,
		size: typeof blob.size === "number" ? blob.size : 0,
		mimeType,
	});

	const device = await saveBlobToDevice(blob, songTitle);
	return { device };
};

/**
 * Retrieves an audio Blob from IndexedDB for offline playback
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<Blob|null>} Audio Blob or null if not cached
 */
export const getOfflineAudioBlob = async (songId) => {
	const entry = await audioIdbService.getWithMeta(songId);
	return entry ? entry.blob : null;
};

/**
 * Retrieves cached audio metadata (including stored updatedAt) for a song
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<Object|null>} Metadata object or null if not cached
 */
export const getOfflineAudioMeta = async (songId) => {
	return audioIdbService.getWithMeta(songId);
};

/**
 * Determines whether a cached audio file is stale relative to the song record
 * A copy is stale when the song record's updatedAt is newer than the stored
 * updatedAt recorded at save time.
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<boolean>} True if a local copy exists but is stale
 */
export const isAudioStale = async (songId) => {
	const meta = await audioIdbService.getWithMeta(songId);
	if (!meta) return false;
	if (!meta.updatedAt) return false;
	let remoteUpdatedAt = "";
	try {
		const song = await songIdbService.getById(songId);
		if (song && song.updatedAt) remoteUpdatedAt = song.updatedAt;
	} catch (err) {
		console.warn("Could not look up song updatedAt for staleness check:", err);
		return false;
	}
	if (!remoteUpdatedAt) return false;
	return new Date(remoteUpdatedAt) > new Date(meta.updatedAt);
};

/**
 * @fileoverview Audio download utility
 * Provides functions for downloading and caching audio files for offline playback
 */

import backendURL from "../../config/backend-url.config";
import { audioIdbService } from "../db/audio-idb-service.util";

/**
 * Downloads an audio file for a song and triggers a device download
 * Uses File System Access API (showSaveFilePicker) when available for better UX
 * Falls back to blob URL + anchor click for other browsers
 *
 * @param {string} songId - Song identifier
 * @param {string} songTitle - Song title used for the downloaded filename
 * @returns {Promise<void>}
 * @throws {Error} If fetch fails or download cannot be initiated
 */
export const downloadAudioFile = async (songId, songTitle) => {
	const response = await fetch(`${backendURL}/api/song/${songId}/audio`);
	if (!response.ok) throw new Error("Failed to fetch audio file");
	const blob = await response.blob();

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
			return;
		} catch (err) {
			if (err.name === "AbortError") return;
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
};

/**
 * Fetches audio blob from server and caches it in IndexedDB for offline playback
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<void>}
 * @throws {Error} If fetch fails or caching fails
 */
export const cacheAudioForOffline = async (songId) => {
	const response = await fetch(`${backendURL}/api/song/${songId}/audio`);
	if (!response.ok) throw new Error("Failed to fetch audio file");
	const blob = await response.blob();
	await audioIdbService.store(songId, blob);
};

/**
 * Retrieves an audio Blob from IndexedDB for offline playback
 *
 * @param {string} songId - Song identifier
 * @returns {Promise<Blob|null>} Audio Blob or null if not cached
 */
export const getOfflineAudioBlob = async (songId) => {
	return audioIdbService.get(songId);
};

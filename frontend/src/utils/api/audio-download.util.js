/**
 * @fileoverview Audio download utility
 * Provides the single save-offline entry point for the download button,
 * plus read helpers for the offline audio player.
 */

import backendURL from "../../config/backend-url.config";
import { audioIdbService } from "../db/audio-idb-service.util";
import { songIdbService } from "../db/song-idb-service.util";

/**
 * Reads the total size from a Content-Range header ("bytes 0-499/1200")
 *
 * @param {Response} response - A 206 response
 * @returns {number} Total byte size, or NaN when the header is missing or unparsable
 * @private
 */
const totalFromContentRange = (response) => {
	const match = /\/(\d+)\s*$/.exec(response.headers.get("content-range") || "");
	return match ? Number(match[1]) : NaN;
};

/**
 * Completes a partial (206) response by requesting the remaining byte ranges.
 *
 * @param {string} url - Audio URL
 * @param {Response} first - The 206 response already received
 * @param {(fraction: number) => void} [onProgress] - Called with 0-1 after each part
 * @returns {Promise<Blob[]>} Every part, in order, covering the whole file
 * @throws {Error} If the total size is unknown or a part is missing or out of order
 * @private
 */
const collectRemainingParts = async (url, first, onProgress) => {
	const total = totalFromContentRange(first);
	if (!Number.isFinite(total)) throw new Error("Audio response is partial and has no total size");
	const parts = [await first.blob()];
	let received = parts[0].size;
	onProgress?.(Math.min(received / total, 1));
	while (received < total) {
		const response = await fetch(url, { headers: { Range: `bytes=${received}-` } });
		if (response.status !== 206) throw new Error("Failed to fetch audio file");
		const part = await response.blob();
		if (part.size === 0) throw new Error("Audio download stalled");
		parts.push(part);
		received += part.size;
		onProgress?.(Math.min(received / total, 1));
	}
	if (received !== total) throw new Error("Audio download size mismatch");
	return parts;
};

/**
 * Reads a full (200) response body, reporting progress against Content-Length.
 * Falls back to a single read, with no intermediate progress, when the stream
 * or the length is unavailable.
 *
 * @param {Response} response - A 200 response
 * @param {(fraction: number) => void} [onProgress] - Called with 0-1 as bytes arrive
 * @returns {Promise<Blob>} The whole body
 * @private
 */
const readBodyWithProgress = async (response, onProgress) => {
	const total = Number(response.headers.get("content-length")) || 0;
	if (!response.body || !total) return response.blob();

	const reader = response.body.getReader();
	const chunks = [];
	let received = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		received += value.length;
		onProgress?.(Math.min(received / total, 1));
	}
	return new Blob(chunks, { type: response.headers.get("content-type") || "" });
};

/**
 * Fetches a song's complete audio as a Blob. A partial 206 response is never accepted as
 * the whole file: the remaining ranges are fetched, or the call fails.
 *
 * @param {string} songId - Song identifier
 * @param {(fraction: number) => void} [onProgress] - Called with 0-1 as bytes arrive
 * @returns {Promise<{blob: Blob, mimeType: string}>} Audio bytes and content type
 * @throws {Error} If the request fails or the audio cannot be completed
 * @private
 */
const fetchAudioBlob = async (songId, onProgress) => {
	const url = `${backendURL}/api/song/${songId}/audio`;
	const response = await fetch(url);
	if (!response.ok) throw new Error("Failed to fetch audio file");
	const contentType = response.headers.get("content-type") || "";
	const blob =
		response.status === 206
			? new Blob(await collectRemainingParts(url, response, onProgress), {
					type: contentType,
			  })
			: await readBodyWithProgress(response, onProgress);
	return { blob, mimeType: blob.type || contentType };
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
 * Saves a song's audio for offline playback.
 *
 * Single entry point for the download button. The copy lives in IndexedDB and
 * the player prefers it over the stream; nothing is written to the device's
 * files, so no browser save dialog opens.
 *
 * @param {string} songId - Song identifier
 * @param {(fraction: number) => void} [onProgress] - Called with 0-1 while the audio downloads
 * @returns {Promise<void>}
 * @throws {Error} If the fetch or the IndexedDB write fails
 * @example
 * ```javascript
 * await saveAudioOffline(song._id, (fraction) => console.log(fraction));
 * ```
 */
export const saveAudioOffline = async (songId, onProgress) => {
	const { blob, mimeType } = await fetchAudioBlob(songId, onProgress);
	const remoteUpdatedAt = await lookupRemoteUpdatedAt(songId);

	await audioIdbService.store(songId, {
		_id: songId,
		songId,
		blob,
		updatedAt: remoteUpdatedAt,
		size: typeof blob.size === "number" ? blob.size : 0,
		mimeType,
	});
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

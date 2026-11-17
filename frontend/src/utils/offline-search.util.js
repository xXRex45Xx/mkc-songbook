/**
 * @fileoverview Offline search helpers
 * Filters and sorts locally cached records so listing pages keep working
 * without a connection, where server-side regex and collation are unavailable.
 * Text matching follows the server's rule: each Amharic letter also matches its
 * look-alike and sound-alike variants (`similarRegexMap`), so the same query
 * finds the same records online and offline. Sorting only approximates the
 * server's collation.
 */

import { similarRegexMap } from "./amharic-map.util";

/**
 * Maps the user-facing sort options to the fields the backend sorts by
 * @type {Object.<string, string>}
 */
const SONG_SORT_FIELDS = {
	"A-Z": "title",
	"Recently Added": "createdAt",
	Number: "_id",
};

/**
 * Normalizes a value for case-insensitive comparison
 *
 * @param {*} value - Value to normalize
 * @returns {string} Lower-cased string form, empty for null/undefined
 */
const normalize = (value) => (value == null ? "" : String(value)).toLowerCase();

/**
 * Builds the case-insensitive pattern the server searches with
 *
 * Mirrors the backend's `regexBuilder` (`backend/utils/amharic-map.util.js`):
 * a character listed in `similarRegexMap` becomes the class of its variants,
 * and every other character is escaped so typed punctuation such as `.` or `(`
 * matches itself.
 *
 * @param {string} query - Text typed in the search box
 * @returns {RegExp} Pattern that matches text containing the query or a variant spelling of it
 * @example
 * buildSearchPattern("ፀጋሕ").test("ጸጋህ"); // true
 */
export const buildSearchPattern = (query) => {
	let source = "";
	for (const char of String(query)) {
		source += similarRegexMap[char] ?? char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(source, "i");
};

/**
 * Checks whether any of the given fields matches the pattern
 *
 * @param {Object} record - Record to inspect
 * @param {RegExp} pattern - Pattern from `buildSearchPattern`
 * @param {string[]} fields - Field names to search
 * @returns {boolean} True when at least one field matches
 */
const matchesAnyField = (record, pattern, fields) =>
	fields.some((field) => pattern.test(record?.[field] == null ? "" : String(record[field])));

/**
 * Compares two song ids the way the backend's numeric collation does,
 * falling back to a numeric-aware string comparison for non-numeric ids
 *
 * @param {string} a - First id
 * @param {string} b - Second id
 * @returns {number} Negative, zero, or positive
 */
const compareNumericId = (a, b) => {
	const numA = Number(a);
	const numB = Number(b);

	if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;

	return String(a).localeCompare(String(b), "en", { numeric: true });
};

/**
 * Filters locally cached songs by the same query shape the API accepts
 *
 * @param {Array<Object>} songs - Songs from IndexedDB
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search text
 * @param {string} [searchQuery.type] - One of "title", "lyrics", "id", or a combined search
 * @returns {Array<Object>} Matching songs, unsorted
 */
export const filterLocalSongs = (songs, { q, type } = {}) => {
	const query = normalize(q);
	if (!query) return songs;
	const pattern = buildSearchPattern(q);

	return songs.filter((song) => {
		if (type === "title") return matchesAnyField(song, pattern, ["title"]);
		if (type === "lyrics") return matchesAnyField(song, pattern, ["lyrics"]);
		if (type === "id") return normalize(song?._id) === query;
		return matchesAnyField(song, pattern, ["title", "lyrics", "_id"]);
	});
};

/**
 * Sorts locally cached songs using the backend's sort option names
 *
 * @param {Array<Object>} songs - Songs to sort
 * @param {string} [sortBy] - "A-Z", "Number", or "Recently Added"
 * @returns {Array<Object>} A new sorted array; the input is not mutated
 */
export const sortLocalSongs = (songs, sortBy) => {
	const field = SONG_SORT_FIELDS[sortBy] || "_id";

	return [...songs].sort((a, b) => {
		if (field === "_id") return compareNumericId(a?._id, b?._id);

		return normalize(a?.[field]).localeCompare(normalize(b?.[field]), "en", {
			numeric: true,
		});
	});
};

/**
 * Filters and sorts locally cached songs
 *
 * @param {Array<Object>} songs - Songs from IndexedDB
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search text
 * @param {string} [searchQuery.type] - Search type
 * @param {string} [searchQuery.sortBy] - Sort option
 * @returns {Array<Object>} Matching songs in the requested order
 */
export const searchLocalSongs = (songs, searchQuery = {}) =>
	sortLocalSongs(filterLocalSongs(songs, searchQuery), searchQuery.sortBy);

/**
 * Splits locally cached songs into title matches and lyrics matches
 *
 * Mirrors the server's combined ("All Categories") search, which returns the
 * songs whose title matches and, separately, the songs whose lyrics match.
 * The song number is not searched, as on the server.
 *
 * @param {Array<Object>} songs - Songs from IndexedDB
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search text
 * @param {string} [searchQuery.sortBy] - Sort option
 * @returns {{titleMatch: Array<Object>, lyricsMatch: Array<Object>}} Both match lists in the requested order, unpaginated
 */
export const searchLocalSongMatches = (songs, { q, sortBy } = {}) => ({
	titleMatch: sortLocalSongs(filterLocalSongs(songs, { q, type: "title" }), sortBy),
	lyricsMatch: sortLocalSongs(filterLocalSongs(songs, { q, type: "lyrics" }), sortBy),
});

/**
 * Filters locally cached albums by name, with the same variant matching as the server
 *
 * @param {Array<Object>} albums - Albums from IndexedDB
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search text matched against the album name
 * @returns {Array<Object>} Matching albums
 */
export const filterLocalAlbums = (albums, { q } = {}) => {
	if (!normalize(q)) return albums;
	const pattern = buildSearchPattern(q);

	return albums.filter((album) => matchesAnyField(album, pattern, ["name"]));
};

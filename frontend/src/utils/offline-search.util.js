/**
 * @fileoverview Offline search helpers
 * Filters and sorts locally cached records so listing pages keep working
 * without a connection, where server-side regex and collation are unavailable.
 * The matching is a deliberately simple substring search: it approximates the
 * server's behaviour instead of trying to reproduce it exactly.
 */

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
 * Checks whether any of the given fields contains the query
 *
 * @param {Object} record - Record to inspect
 * @param {string} query - Already normalized query
 * @param {string[]} fields - Field names to search
 * @returns {boolean} True when at least one field matches
 */
const matchesAnyField = (record, query, fields) =>
	fields.some((field) => normalize(record?.[field]).includes(query));

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

	return songs.filter((song) => {
		if (type === "title") return matchesAnyField(song, query, ["title"]);
		if (type === "lyrics") return matchesAnyField(song, query, ["lyrics"]);
		if (type === "id") return normalize(song?._id) === query;
		return matchesAnyField(song, query, ["title", "lyrics", "_id"]);
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
 * Filters locally cached albums by name
 *
 * @param {Array<Object>} albums - Albums from IndexedDB
 * @param {Object} [searchQuery] - Search parameters
 * @param {string} [searchQuery.q] - Search text matched against the album name
 * @returns {Array<Object>} Matching albums
 */
export const filterLocalAlbums = (albums, { q } = {}) => {
	const query = normalize(q);
	if (!query) return albums;

	return albums.filter((album) => normalize(album?.name).includes(query));
};

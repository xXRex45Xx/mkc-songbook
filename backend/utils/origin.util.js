/**
 * Allowed-origin utilities.
 * @module utils/origin
 */

/**
 * Parses the ALLOWED_ORIGINS environment variable into a normalized list.
 * Defaults to an empty list when the variable is unset, so the process does
 * not crash at boot. Each entry is trimmed and stripped of a trailing slash so
 * `http://example.com/` and `http://example.com` compare equal.
 *
 * @returns {string[]} Normalized list of allowed origins
 */
export const getAllowedOrigins = () => {
	const raw = process.env.ALLOWED_ORIGINS;
	if (!raw || typeof raw !== "string") return [];
	return raw
		.split(",")
		.map((origin) => origin.trim().replace(/\/+$/, ""))
		.filter(Boolean);
};

/**
 * Longest `Origin` header value the server will compare. A real origin is
 * scheme, host and port, far below this bound.
 */
export const MAX_ORIGIN_LENGTH = 256;

/**
 * Normalizes a client-supplied `Origin` header value for comparison against
 * the allow-list: strips trailing slashes with a linear scan. The caller
 * controls this input, so no backtracking regex may run on it. A value that is
 * not a string or is longer than {@link MAX_ORIGIN_LENGTH} cannot be a real
 * origin; it returns `null` before any scan and must be treated as not allowed.
 *
 * @param {unknown} origin - Raw `Origin` header value
 * @returns {string|null} Origin without trailing slashes, or null when over-long or not a string
 */
export const normalizeOrigin = (origin) => {
	if (typeof origin !== "string" || origin.length > MAX_ORIGIN_LENGTH) return null;
	let end = origin.length;
	while (end > 0 && origin.charCodeAt(end - 1) === 47) end--;
	return origin.slice(0, end);
};

/**
 * Tells whether a client-supplied `Origin` header value is in the allow-list,
 * ignoring trailing slashes.
 *
 * @param {unknown} origin - Raw `Origin` header value
 * @param {string[]} allowed - Normalized allow-list from {@link getAllowedOrigins}
 * @returns {boolean} True when the normalized origin is listed; false when unlisted or over-long
 */
export const isAllowedOrigin = (origin, allowed) => {
	const normalized = normalizeOrigin(origin);
	return normalized !== null && allowed.includes(normalized);
};

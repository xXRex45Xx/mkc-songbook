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

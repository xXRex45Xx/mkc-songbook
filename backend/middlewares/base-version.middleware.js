/**
 * Base-version middleware
 *
 * Lets a replayed offline write say which version of a record it was made against, so a
 * stale edit cannot silently overwrite newer server data.
 *
 * @module base-version.middleware
 */

import { ClientFaultError } from "../utils/error.util.js";

/** Request header carrying the `updatedAt` the client last saw for the record. */
export const BASE_VERSION_HEADER = "x-base-updated-at";

/**
 * Build a middleware that answers 409 when the record changed after the client's base version.
 *
 * A request without the header, or with an unparsable value, passes unchecked, as does a
 * request for a record that does not exist (the controller answers 404).
 *
 * @param {import("mongoose").Model} Model - Model of the record named by `req.params.id`
 * @returns {Function} Express middleware
 * @throws {ClientFaultError} Status 409 if the stored `updatedAt` is later than the header
 * @example
 * router.put("/:id", wrapAsync(checkBaseVersion(SongModel)), wrapAsync(updateSong));
 */
export const checkBaseVersion = (Model) => async (req, _res, next) => {
	const header = req.get(BASE_VERSION_HEADER);
	if (!header) return next();

	const base = new Date(header);
	if (Number.isNaN(base.getTime())) return next();

	const record = await Model.findById(req.params.id).select("updatedAt").lean();
	if (record?.updatedAt && new Date(record.updatedAt) > base)
		throw new ClientFaultError(
			"This record changed on the server after the edit was made.",
			409
		);
	next();
};

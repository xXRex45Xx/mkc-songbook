/**
 * CSRF Middleware Module.
 * The session cookies are sent by the browser on its own, so a state-changing request needs a
 * second proof that our frontend made it. Two checks: an `Origin` header, when present, must be
 * in `ALLOWED_ORIGINS`; and a request that carries a session cookie must also carry
 * `X-Requested-With: mkc`. A custom header forces a CORS preflight, which only allowed
 * origins pass.
 * @module middlewares/csrf
 */
import { ForbiddenError } from "../utils/error.util.js";
import { getAllowedOrigins } from "../utils/origin.util.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../utils/session.util.js";

export const CSRF_HEADER = "X-Requested-With";
export const CSRF_VALUE = "mkc";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Rejects state-changing requests that do not come from the frontend. Safe methods pass.
 * Requests with an `Authorization` header pass too: a browser never adds that header by
 * itself, so it cannot be forged cross-site. Old clients that still send a Bearer token rely
 * on this until the legacy token lifetime ends.
 *
 * @param {Request} req - Express request object
 * @param {Response} _res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const csrfProtection = (req, _res, next) => {
	if (SAFE_METHODS.has(req.method) || req.headers.authorization) return next();

	const origin = req.headers.origin;
	const allowed = getAllowedOrigins();
	if (origin && allowed.length > 0 && !allowed.includes(origin.replace(/\/+$/, "")))
		return next(new ForbiddenError("Request origin is not allowed."));

	// A request with no session cookie has no ambient credentials to abuse; it fails auth on its own.
	const hasSession = Boolean(req.cookies?.[ACCESS_COOKIE] || req.cookies?.[REFRESH_COOKIE]);
	if (hasSession && req.get(CSRF_HEADER) !== CSRF_VALUE)
		return next(new ForbiddenError("Missing request header."));

	next();
};

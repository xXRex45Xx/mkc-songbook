/**
 * @fileoverview Fetch wrapper for API calls that use the cookie session
 * Sends the session cookies, adds the CSRF header to state-changing requests, and renews an
 * expired access cookie: on a 401 it refreshes the session once and retries the request once.
 */

import backendURL from "../../config/backend-url.config";
import { endSession, isSignedIn } from "../session.util";

/** Header the server requires on state-changing requests that carry a session cookie. */
const CSRF_HEADERS = { "X-Requested-With": "mkc" };

const SAFE_METHODS = ["GET", "HEAD"];

const REFRESH_LOCK = "mkc-session-refresh";

/** The refresh in progress in this tab, shared by every request that hit a 401 meanwhile. */
let refreshInFlight = null;

/**
 * Asks the server to rotate the refresh token and renew the access cookie
 *
 * @returns {Promise<"renewed"|"expired"|"failed">} `expired` means the server refused the
 *   refresh token, so the session is over; `failed` is any other failure
 */
const requestRefresh = async () => {
	const response = await fetch(`${backendURL}/api/user/session/refresh`, {
		method: "POST",
		credentials: "include",
		headers: CSRF_HEADERS,
	});

	if (response.ok) return "renewed";
	return response.status === 401 ? "expired" : "failed";
};

/**
 * Refreshes the session once, however many requests ask at the same time. Tabs take turns
 * through the Web Locks API where it exists, so they do not rotate the token together.
 *
 * @returns {Promise<"renewed"|"expired"|"failed">} Outcome of the refresh
 */
const refreshSession = () => {
	if (!refreshInFlight) {
		const run = navigator.locks
			? () => navigator.locks.request(REFRESH_LOCK, requestRefresh)
			: requestRefresh;

		refreshInFlight = run()
			.catch(() => "failed")
			.finally(() => {
				refreshInFlight = null;
			});
	}

	return refreshInFlight;
};

/**
 * Calls the API with the session cookies
 *
 * A 401 on a signed-in browser triggers one refresh and one retry. If the server refuses the
 * refresh, the session ends on this device and the original 401 response is returned. If the
 * refresh fails for another reason (offline, throttled, server error), the session is kept and
 * the call fails like an unreachable network, so a mutation is queued instead of lost.
 *
 * @param {string} url - Absolute request URL
 * @param {RequestInit} [init] - Fetch options; `credentials` is always `include`
 * @param {Object} [options] - Wrapper options
 * @param {boolean} [options.refresh=true] - When false, a 401 is returned as is
 * @returns {Promise<Response>} The fetch response
 * @throws {TypeError} If the request, or the session refresh it needed, cannot reach the server
 * @example
 * const response = await apiFetch(`${backendURL}/api/user/favorites`);
 */
export const apiFetch = async (url, init = {}, { refresh = true } = {}) => {
	const method = (init.method || "GET").toUpperCase();
	// A custom header makes the browser preflight the request, so reads go without it.
	const csrf = SAFE_METHODS.includes(method) ? {} : CSRF_HEADERS;

	const send = () =>
		fetch(url, {
			...init,
			credentials: "include",
			headers: { ...csrf, ...init.headers },
		});

	const response = await send();
	if (response.status !== 401 || !refresh || !isSignedIn()) return response;

	const outcome = await refreshSession();
	if (outcome === "renewed") return send();
	if (outcome === "failed") throw new TypeError("Could not renew the session.");
	await endSession();

	return response;
};

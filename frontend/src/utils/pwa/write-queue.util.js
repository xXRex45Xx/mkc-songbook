/**
 * @fileoverview Offline write queue
 * Records mutations that could not reach the server and replays them, in order,
 * once a connection is available.
 *
 * This is deliberately an app-level queue rather than the Workbox
 * `backgroundSync` route option: the Background Sync API is not implemented in
 * Safari, so a service-worker queue would silently do nothing on iOS. An
 * IndexedDB queue works on every browser the app supports and lets the UI show
 * what is still pending.
 *
 * Replay is last-write-wins. The backend has no optimistic concurrency, so a
 * queued edit replayed after a newer edit overwrites it.
 */

import { getDB } from "../db/indexed-db.util";
import store from "../../store/store";
import { setWriteQueueSummary } from "../../store/slices/pwa.slice";
import {
  applyOptimisticWrite,
  parseResource,
  readBaseUpdatedAt,
} from "./optimistic-write.util";

const STORE_NAME = "pendingWrites";

/**
 * Monotonic tie-breaker for entries created in the same millisecond, so
 * replay order stays creation order even when `createdAt` collides.
 * @type {number}
 */
let writeSequence = 0;

/**
 * HTTP methods that may be queued. Reads are never queued.
 * @type {string[]}
 */
/** Request header that carries the record version a replayed edit was made against. */
const BASE_VERSION_HEADER = "X-Base-Updated-At";

/** Message stored on an entry the server refused because the record changed meanwhile. */
const CONFLICT_MESSAGE =
  "Changed on the server after this edit was made, so the server version was kept.";

const QUEUEABLE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Builds a unique id for a queued write
 *
 * @returns {string} Queue entry id
 */
const nextSequence = () => {
  writeSequence += 1;
  return writeSequence;
};

const createId = () => {
  if (globalThis.crypto?.randomUUID) return `pw_${crypto.randomUUID()}`;

  return `pw_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Converts a request body into a shape IndexedDB can persist
 *
 * Blobs and text are both structured-cloneable, so a FormData body is stored as
 * its entry list rather than as an encoded multipart string.
 *
 * @param {FormData|string|null|undefined} body - Request body
 * @returns {{kind: string, entries: Array, value: string}|null} Serialized body, null when absent
 * @throws {Error} If the body type cannot be replayed
 */
const serializeBody = (body) => {
  if (body === null || body === undefined) return null;

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return { kind: "formData", entries: Array.from(body.entries()) };
  }

  if (typeof body === "string") return { kind: "text", value: body };

  throw new Error("This request body cannot be queued for offline replay.");
};

/**
 * Rebuilds a request body from its stored form
 *
 * @param {Object|null} payload - Stored body payload
 * @returns {FormData|string|undefined} Body ready for fetch
 */
const deserializeBody = (payload) => {
  if (!payload) return undefined;

  if (payload.kind === "formData") {
    const formData = new FormData();
    for (const [key, value] of payload.entries) formData.append(key, value);
    return formData;
  }

  return payload.value;
};

/**
 * Performs a queued or immediate request
 *
 * @param {Object} entry - Request definition
 * @param {string} entry.url - Absolute request URL
 * @param {string} entry.method - HTTP method
 * @param {Object} [entry.headers] - Request headers
 * @param {FormData|string|undefined} [entry.body] - Request body
 * @returns {Promise<Response>} The fetch response
 */
/**
 * Copies headers without the login token. The token is stored nowhere in the queue: replay
 * reads the current one, so a token that expired while the write waited cannot fail it.
 *
 * @param {Object} headers - Request headers as given by the caller
 * @returns {Object} Headers without `Authorization`
 */
const withoutAuthorization = (headers) => {
  const rest = { ...(headers || {}) };
  delete rest.Authorization;
  delete rest.authorization;
  return rest;
};

/**
 * Key that identifies the record an entry changes, so repeated edits of one record can be
 * told apart from edits of another. Requests with no record id use their URL.
 *
 * @param {Object} entry - Queue entry or request with `url`
 * @returns {string} Resource key
 */
const resourceKey = (entry) => {
  const target = parseResource(entry.url);
  return target ? `${target.kind}:${target.id}` : entry.url;
};

/**
 * Reads the user id out of a login token, only to tell whose token it is. The token is not
 * verified here; the server does that on every request.
 *
 * @param {string|null|undefined} token - JWT from the login response
 * @returns {string|null} User id, or null when the token is missing or malformed
 */
const tokenOwner = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).id ?? null;
  } catch {
    return null;
  }
};

const performRequest = ({ url, method, headers, body }) =>
  fetch(url, { method, headers, body });

/**
 * Reads a JSON response body without throwing on empty or malformed bodies
 *
 * @param {Response} response - Fetch response
 * @returns {Promise<Object|null>} Parsed body, or null when there is none
 */
const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Reads the queue and keeps the Redux summary in sync with it
 *
 * @returns {Promise<{pending: number, failed: number}>} Queue summary
 * @throws {Error} If the database read fails
 */
export const refreshWriteQueueSummary = async () => {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);

  const summary = {
    pending: entries.filter((entry) => !entry.permanent).length,
    failed: entries.filter((entry) => entry.permanent).length,
  };

  store.dispatch(setWriteQueueSummary(summary));
  return summary;
};

/**
 * Adds a mutation to the queue
 *
 * @param {Object} entry - Request definition
 * @param {string} entry.url - Absolute request URL
 * @param {string} entry.method - HTTP method
 * @param {Object} [entry.headers] - Request headers; the auth token is read for its owner, never stored
 * @param {FormData|string} [entry.body] - Request body
 * @param {string} [entry.label] - Human readable description for diagnostics
 * @returns {Promise<void>}
 * @throws {Error} If the method or body cannot be queued
 */
export const queueWrite = async ({ url, method, headers, body, label }) => {
  if (!QUEUEABLE_METHODS.includes(method)) {
    throw new Error(`${method} requests cannot be queued.`);
  }

  const db = await getDB();
  const serializedBody = serializeBody(body);

  // Only the first queued edit of a record carries a base version: later ones were made on
  // top of that edit, so they are checked as one chain with it.
  const queued = await db.getAll(STORE_NAME);
  const chained = queued.some(
    (entry) => !entry.permanent && resourceKey(entry) === resourceKey({ url })
  );
  const baseUpdatedAt = chained ? null : await readBaseUpdatedAt(url);

  await db.put(STORE_NAME, {
    id: createId(),
    sequence: nextSequence(),
    url,
    method,
    headers: withoutAuthorization(headers),
    baseUpdatedAt,
    body: serializedBody,
    label: label || `${method} ${url}`,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
    permanent: false,
    owner: tokenOwner(headers?.Authorization?.replace(/^Bearer /, "")),
  });

  await applyOptimisticWrite({ url, method, body: serializedBody });
  await refreshWriteQueueSummary();
};

/**
 * Reads every queued write, oldest first
 *
 * @returns {Promise<Array<Object>>} Queued entries in replay order
 * @throws {Error} If the database read fails
 */
export const getPendingWrites = async () => {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);

  return entries.sort((a, b) => {
    const byTime = String(a.createdAt).localeCompare(String(b.createdAt));
    if (byTime !== 0) return byTime;
    return (a.sequence ?? 0) - (b.sequence ?? 0);
  });
};

/**
 * Removes a single queued write
 *
 * @param {string} id - Queue entry id
 * @returns {Promise<void>}
 * @throws {Error} If the database write fails
 */
export const removeWrite = async (id) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

/**
 * Deletes every queued write
 *
 * @returns {Promise<void>}
 * @throws {Error} If the database write fails
 */
export const clearWriteQueue = async () => {
  const db = await getDB();
  await db.clear(STORE_NAME);
  await refreshWriteQueueSummary();
};

/**
 * Deletes only the entries the server permanently rejected
 *
 * Deliberately distinct from `clearWriteQueue`: discarding failures must never
 * also throw away changes that are still waiting to be sent.
 *
 * @returns {Promise<void>}
 * @throws {Error} If the database write fails
 */
export const clearFailedWrites = async () => {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);

  for (const entry of entries) {
    if (entry.permanent) await db.delete(STORE_NAME, entry.id);
  }

  await refreshWriteQueueSummary();
};

/**
 * Applies a patch to an existing queue entry
 *
 * @param {Object} entry - Existing entry
 * @param {Object} patch - Fields to overwrite
 * @returns {Promise<void>}
 * @throws {Error} If the database write fails
 */
const updateEntry = async (entry, patch) => {
  const db = await getDB();
  await db.put(STORE_NAME, { ...entry, ...patch });
};

/**
 * Replays queued writes in order
 *
 * Sends the current login token, not the one saved at queue time, so a token that expired
 * while the write waited cannot fail it; a 401 keeps the entry for the next sign-in. A record
 * edited offline is sent with the version the device saw (`X-Base-Updated-At`); a 409 means
 * the server copy is newer, so that entry and later edits of the same record are marked
 * permanent and the server version stays.
 *
 * Stops at the first transport failure so ordering is preserved: a create must
 * reach the server before the update that targets it. Entries the server
 * rejects with a 4xx are marked permanent instead of being retried forever, and
 * stay visible in the UI rather than being discarded silently.
 *
 * @returns {Promise<{flushed: number, pending: number, failed: number}>} Replay outcome
 * @throws {Error} If the database read fails
 */
export const flushPendingWrites = async () => {
  if (!navigator.onLine) {
    const summary = await refreshWriteQueueSummary();
    return { flushed: 0, ...summary };
  }

  const entries = await getPendingWrites();
  const token = localStorage.getItem("_s");
  const currentOwner = tokenOwner(token);
  const conflicted = new Set();
  const checked = new Set();
  let flushed = 0;

  for (const entry of entries) {
    if (entry.permanent) continue;

    // An entry made by another account waits until that account signs in again.
    if (entry.owner && currentOwner && entry.owner !== currentOwner) continue;

    if (!token) {
      await updateEntry(entry, { lastError: "Sign in to send this change." });
      break;
    }

    const key = resourceKey(entry);
    if (conflicted.has(key)) {
      await updateEntry(entry, {
        attempts: (entry.attempts || 0) + 1,
        permanent: true,
        lastError: CONFLICT_MESSAGE,
      });
      continue;
    }

    // The first replayed edit of a record proves nothing changed since the device last saw it;
    // later edits of the same record build on it, so they carry no base version.
    const headers = { ...withoutAuthorization(entry.headers), Authorization: `Bearer ${token}` };
    if (entry.baseUpdatedAt && !checked.has(key)) headers[BASE_VERSION_HEADER] = entry.baseUpdatedAt;
    checked.add(key);

    let response;
    try {
      response = await performRequest({
        url: entry.url,
        method: entry.method,
        headers,
        body: deserializeBody(entry.body),
      });
    } catch (error) {
      await updateEntry(entry, {
        attempts: (entry.attempts || 0) + 1,
        lastError: error?.message || "Network unavailable.",
      });
      break;
    }

    // An expired or revoked login is not the edit's fault: keep it and wait for a new sign-in.
    if (response.status === 401) {
      await updateEntry(entry, {
        attempts: (entry.attempts || 0) + 1,
        headers: withoutAuthorization(entry.headers),
        lastError: "Sign in again to send this change.",
      });
      break;
    }

    if (response.status === 409) {
      conflicted.add(key);
      await updateEntry(entry, {
        attempts: (entry.attempts || 0) + 1,
        permanent: true,
        headers: withoutAuthorization(entry.headers),
        lastError: CONFLICT_MESSAGE,
      });
      continue;
    }

    if (response.status >= 400 && response.status < 500) {
      await updateEntry(entry, {
        attempts: (entry.attempts || 0) + 1,
        permanent: true,
        headers: withoutAuthorization(entry.headers),
        lastError: `Rejected by the server with status ${response.status}.`,
      });
      continue;
    }

    if (!response.ok) {
      await updateEntry(entry, {
        attempts: (entry.attempts || 0) + 1,
        headers: withoutAuthorization(entry.headers),
        lastError: `Server error ${response.status}.`,
      });
      break;
    }

    await removeWrite(entry.id);
    flushed += 1;
  }

  const summary = await refreshWriteQueueSummary();
  return { flushed, ...summary };
};

/**
 * Performs a mutation, queueing it when the network is unavailable
 *
 * Only transport failures are queued. HTTP failures carry a `status` and are
 * rethrown so validation and authorization errors still reach the caller.
 *
 * @param {Object} entry - Request definition
 * @param {string} entry.url - Absolute request URL
 * @param {string} entry.method - HTTP method
 * @param {Object} [entry.headers] - Request headers
 * @param {FormData|string} [entry.body] - Request body
 * @param {string} [entry.label] - Human readable description for diagnostics
 * @param {boolean} [entry.queueable=true] - When false the request is never queued: a missing
 *   network is thrown to the caller, who keeps its own record of what is still unsent
 * @returns {Promise<Object>} Parsed response, or { queued: true } when queued
 * @throws {Object} Error with message and status if the server rejects the request
 */
export const sendMutation = async ({ url, method, headers, body, label, queueable = true }) => {
  const queueIt = async () => {
    await queueWrite({ url, method, headers, body, label });
    return { queued: true };
  };

  if (queueable && !navigator.onLine) return queueIt();

  try {
    const response = await performRequest({ url, method, headers, body });
    const data = await parseJson(response);

    if (!response.ok) {
      throw {
        message: data?.message || "An unexpected error occurred.",
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    if (!queueable || (error && typeof error.status === "number")) throw error;
    return queueIt();
  }
};

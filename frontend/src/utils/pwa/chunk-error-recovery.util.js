/**
 * @fileoverview Chunk load error recovery
 * Recovers from a page that fails to load a lazy JavaScript chunk, which
 * happens when a deployment replaces the hashed files an open tab still
 * points at, or when a bad copy of a chunk sits in the service worker cache.
 * The first failure reloads the page; a second failure right after clears the
 * precache and the service worker (online only) and reloads again; a third
 * leaves the router's error page on screen so the app can never reload in a loop.
 */

/**
 * sessionStorage key holding the recovery attempts
 * @type {string}
 */
const ATTEMPTS_KEY = "chunk-recovery-attempts";

/**
 * Time, in milliseconds, after which earlier attempts no longer count
 * @type {number}
 */
const ATTEMPT_WINDOW_MS = 60000;

/**
 * Reads how many recovery attempts happened inside the current window
 *
 * @returns {number} Attempt count, 0 when none, expired, or sessionStorage is unavailable
 */
const readAttempts = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(ATTEMPTS_KEY));
    if (saved && Date.now() - saved.at <= ATTEMPT_WINDOW_MS) return saved.count;
  } catch {
    // Unavailable or unreadable: count as no earlier attempt.
  }
  return 0;
};

/**
 * Records the number of recovery attempts, stamped with the current time
 *
 * @param {number} count - Attempts made so far
 * @returns {void}
 */
const writeAttempts = (count) => {
  try {
    sessionStorage.setItem(
      ATTEMPTS_KEY,
      JSON.stringify({ count, at: Date.now() })
    );
  } catch {
    // Unavailable: the recovery still runs, only the loop guard is lost.
  }
};

/**
 * Reloads the app, optionally discarding the service worker and its precache first
 *
 * Clearing is skipped while offline, because the precache is the only copy of
 * the app shell then. Data in IndexedDB and the other caches (album covers,
 * API responses) is left alone; the new service worker precaches the current
 * build again on load.
 *
 * @param {Object} [options] - Reload options
 * @param {boolean} [options.clearCaches=false] - Delete the precache and unregister the service worker before reloading
 * @returns {Promise<void>} Resolves just before the page reloads
 */
export const reloadApp = async ({ clearCaches = false } = {}) => {
  if (clearCaches && navigator.onLine) {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      if (typeof caches !== "undefined") {
        const names = await caches.keys();
        await Promise.all(
          names.filter((name) => /precache/i.test(name)).map((name) => caches.delete(name))
        );
      }
    } catch (error) {
      console.warn("Could not clear the app cache:", error);
    }
  }
  window.location.reload();
};

/**
 * Handles Vite's `vite:preloadError` event
 *
 * @param {Event} event - The preload error event (`event.payload` holds the import error)
 * @returns {void}
 */
const handlePreloadError = (event) => {
  const attempts = readAttempts();
  if (attempts === 0) {
    writeAttempts(1);
    event.preventDefault();
    reloadApp();
  } else if (attempts === 1 && navigator.onLine) {
    writeAttempts(2);
    event.preventDefault();
    reloadApp({ clearCaches: true });
  }
  // Otherwise leave the error to the router's error page.
};

/**
 * Starts listening for failed chunk loads
 *
 * @returns {void}
 */
export const setupChunkErrorRecovery = () => {
  window.addEventListener("vite:preloadError", handlePreloadError);
};

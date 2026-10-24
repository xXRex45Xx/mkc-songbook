/**
 * @fileoverview PWA registration utility
 * Handles service worker registration, update checks, connectivity changes,
 * and the sync lifecycle. Integrates with the Redux store for PWA state.
 */

import { registerSW } from "virtual:pwa-register";
import {
  initializePwaData,
  syncAll,
  getLastFullSyncTime,
} from "./sync-service.util";
import {
  flushPendingWrites,
  refreshWriteQueueSummary,
} from "./write-queue.util";
import { setupInstallListeners } from "./install.util";
import store from "../../store/store";
import {
  setOfflineReady,
  setOnline,
  setSyncing,
  setLastSyncTime,
  setSyncComplete,
  setSyncError,
  setSwError,
} from "../../store/slices/pwa.slice";

/**
 * How often to poll the service worker for a new release while online
 * @type {number}
 */
const SW_UPDATE_INTERVAL_MS = 3600000;

/**
 * The active service worker registration, kept so update checks can be
 * deferred until the device is actually online.
 * @type {ServiceWorkerRegistration|null}
 */
let swRegistration = null;

/**
 * Handle for the periodic update interval
 * @type {number|null}
 */
let swUpdateInterval = null;

/**
 * Shared handle for an in-flight sync so concurrent triggers (boot,
 * reconnection, service worker ready) collapse into one request.
 * @type {Promise<Object>|null}
 */
let syncInFlight = null;

/**
 * Runs a delta sync and reports the outcome to the Redux store
 *
 * Replays queued writes first so the server reflects local changes before the
 * delta sync pulls the merged result back down. Unsynced local playlists are
 * uploaded next, because they are created locally and have no server-side
 * record until they are sent. Falls back to the full initial load when no
 * sync cursor exists yet. Does nothing while offline; the reconnect handler
 * will pick it up.
 *
 * @returns {Promise<void>}
 */
const performSync = async () => {
  store.dispatch(setSyncing(true));
  try {
    await flushPendingWrites();
    await syncLocalPlaylists();

    const lastSync = await getLastFullSyncTime();
    const result = lastSync ? await syncAll() : await initializePwaData();
    store.dispatch(setSyncComplete(result));
  } catch (error) {
    store.dispatch(
      setSyncError(error?.message || "Could not sync offline data.")
    );
  }
};

/**
 * Uploads every unsynced local playlist to the server.
 *
 * Separate from `flushPendingWrites` because playlist uploads are not
 * transport-level mutations: they are business operations that create server
 * records and mark the local copy synced. Failures are logged, not fatal —
 * the playlists stay unsynced and are retried on the next sync.
 *
 * @returns {Promise<void>}
 */
const syncLocalPlaylists = async () => {
  const token = localStorage.getItem("_s");
  if (!token) return;

  try {
    const { syncAllUnsyncedPlaylists } = await import(
      "../api/local-playlist-api.util"
    );
    await syncAllUnsyncedPlaylists(token);
  } catch (error) {
    console.warn("Local playlist sync failed:", error);
  }
};

/**
 * Triggers a sync unless one is already running
 *
 * @returns {Promise<void>}
 */
const runSync = () => {
  if (!navigator.onLine) return Promise.resolve();

  if (!syncInFlight) {
    syncInFlight = performSync().finally(() => {
      syncInFlight = null;
    });
  }
  return syncInFlight;
};

/**
 * Asks the browser to check for a new service worker release
 *
 * Only runs while online. A failed check is not user-visible: the periodic
 * interval and the reconnect handler will retry.
 *
 * @returns {void}
 */
const checkForUpdate = () => {
  if (!navigator.onLine || !swRegistration) return;
  swRegistration.update().catch(() => {});
};

/**
 * Restores the last known sync timestamp into the store so the status bar
 * reflects cached data immediately after a reload.
 *
 * @returns {Promise<void>}
 */
const hydrateSyncState = async () => {
  try {
    const lastSyncTime = await getLastFullSyncTime();
    if (lastSyncTime) store.dispatch(setLastSyncTime(lastSyncTime));
  } catch (error) {
    console.warn("Could not read the last sync timestamp:", error);
  }
};

/**
 * Tracks connectivity and reacts to it
 *
 * Going online triggers a deferred sync and a service worker update check,
 * which is how an update interrupted by a lost connection is picked up later.
 * Going offline clears the syncing flag so the UI cannot spin forever.
 *
 * @returns {void}
 */
const setupNetworkListeners = () => {
  const applyConnectivity = () => {
    const online = navigator.onLine;
    store.dispatch(setOnline(online));

    if (!online) {
      store.dispatch(setSyncing(false));
      refreshWriteQueueSummary().catch(() => {});
      return;
    }

    checkForUpdate();
    runSync();
  };

  window.addEventListener("online", applyConnectivity);
  window.addEventListener("offline", applyConnectivity);
  store.dispatch(setOnline(navigator.onLine));
};

/**
 * Asks the browser to protect the offline caches (IndexedDB and Cache
 * Storage) from being evicted under storage pressure. Best effort: the
 * browser may decline, and Firefox may prompt the user.
 *
 * @returns {Promise<void>}
 */
const requestPersistentStorage = async () => {
  try {
    if (!navigator.storage?.persisted || !navigator.storage?.persist) return;
    if (await navigator.storage.persisted()) return;

    await navigator.storage.persist();
  } catch (error) {
    console.warn("Could not request persistent storage:", error);
  }
};

/**
 * Clears the periodic service-worker update check so it does not keep
 * polling in a background tab. Restored when the tab regains visibility.
 *
 * @returns {void}
 */
const clearUpdateInterval = () => {
  if (swUpdateInterval) {
    clearInterval(swUpdateInterval);
    swUpdateInterval = null;
  }
};

/**
 * Registers the PWA service worker and sets up lifecycle callbacks
 *
 * Registration type is `autoUpdate`, so an updated worker activates
 * immediately; no refresh prompt is involved. Update checks are skipped while
 * offline and retried on reconnection. The interval is paused while the tab
 * is hidden and resumed on visibilitychange so it does not burn a fetch per
 * hour in a background tab.
 *
 * @returns {void}
 */
export const registerPwa = () => {
  setupNetworkListeners();
  setupInstallListeners();
  requestPersistentStorage();
  refreshWriteQueueSummary().catch(() => {});
  hydrateSyncState().finally(runSync);

  registerSW({
    onOfflineReady: () => {
      store.dispatch(setOfflineReady(true));
      runSync();
    },
    onRegisteredSW: (_swUrl, registration) => {
      swRegistration = registration || null;

      clearUpdateInterval();
      if (swRegistration) {
        swUpdateInterval = setInterval(checkForUpdate, SW_UPDATE_INTERVAL_MS);
      }
      // Navigation preload is enabled by the `navigationPreload: true` build
      // option in vite.config.js, which emits `enable()` into sw.js; nothing to
      // do here.
    },
    onRegisterError: (error) => {
      console.error("SW registration error:", error);
      store.dispatch(
        setSwError(error?.message || "Service worker registration failed.")
      );
    },
  });

  // Pause the update poll while the tab is hidden; resume on visibilitychange.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearUpdateInterval();
    } else if (swRegistration) {
      clearUpdateInterval();
      swUpdateInterval = setInterval(checkForUpdate, SW_UPDATE_INTERVAL_MS);
    }
  });
};

/**
 * Deletes the IndexedDB database to recover from corruption.
 * Callers must re-initialize data after calling this (e.g., via
 * onOfflineReady which calls initializePwaData).
 *
 * @returns {Promise<void>}
 * @throws {Error} If the database cannot be deleted
 */
export const resetDatabase = async () => {
  const { resetDatabase: idbReset } = await import("../db/indexed-db.util");
  await idbReset();
};

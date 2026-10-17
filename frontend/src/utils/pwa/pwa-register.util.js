/**
 * @fileoverview PWA registration utility
 * Handles service worker registration and lifecycle events
 * Integrates with Redux store for PWA state management
 */

import { registerSW } from "virtual:pwa-register";
import { initializePwaData, syncAll } from "./sync-service.util";
import { syncMetaIdbService } from "../db/sync-meta-idb-service.util";
import store from "../../store/store";
import {
  setOfflineReady,
  setNeedRefresh,
  setSyncComplete,
  setSyncError,
  setSyncing,
} from "../../store/slices/pwa.slice";

const LAST_SONG_SYNC_KEY = "lastSongSync";

let updateSwCallback = null;

/**
 * Registers the PWA service worker and sets up lifecycle callbacks
 * Handles offline readiness, update prompts, and periodic update checks
 *
 * @returns {void}
 */
export const registerPwa = () => {
  updateSwCallback = registerSW({
    onOfflineReady: async () => {
      try {
        const lastSync = await syncMetaIdbService.get(LAST_SONG_SYNC_KEY);
        store.dispatch(setSyncing(true));
        if (!lastSync) {
          await initializePwaData();
        } else {
          await syncAll();
        }
        store.dispatch(setSyncComplete({ songsSynced: 0, albumsSynced: 0 }));
      } catch (error) {
        store.dispatch(setSyncError(error.message));
      }
      store.dispatch(setOfflineReady(true));
    },
    onNeedRefresh: () => {
      store.dispatch(setNeedRefresh(true));
    },
    onRegisteredSW: (_swUrl, registration) => {
      if (registration) {
        setInterval(() => registration.update(), 3600000);
      }
    },
    onRegisterError: (error) => {
      console.error("SW registration error:", error);
      store.dispatch(setSyncError(error.message));
    },
  });
};

/**
 * Triggers a service worker update and page reload
 * Called when user accepts the "Update available" prompt
 *
 * @returns {void}
 */
export const updateSW = () => {
  if (updateSwCallback) {
    updateSwCallback(true);
  }
};
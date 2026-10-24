/**
 * @fileoverview PWA install utility
 * Captures the browser's beforeinstallprompt event, exposes a manual
 * promptInstall(), and records appinstalled. The captured event is held in
 * module state so the header and the PWA status banner can both trigger it.
 *
 * iOS Safari has no beforeinstallprompt, so the UI falls back to a static
 * "Add to Home Screen" instruction card rendered by the caller.
 */

import store from "../../store/store";
import { setInstallable, setInstalled } from "../../store/slices/pwa.slice";

/**
 * The deferred install prompt, captured once and reused for every call.
 * @type {BeforeInstallPromptEvent|null}
 */
let deferredPrompt = null;

/**
 * Captures the browser's install prompt so it can be triggered on demand.
 * Stores the event and flags the app as installable in Redux.
 *
 * @param {BeforeInstallPromptEvent} event - The beforeinstallprompt event
 * @returns {void}
 */
export const captureInstallPrompt = (event) => {
  event.preventDefault();
  deferredPrompt = event;
  store.dispatch(setInstallable(true));
};

/**
 * Records that the app was installed to the host platform.
 *
 * @returns {void}
 */
export const onAppInstalled = () => {
  deferredPrompt = null;
  store.dispatch(setInstallable(false));
  store.dispatch(setInstalled(true));
};

/**
 * Triggers the browser's install prompt.
 *
 * Resolves to the platform's outcome ("accepted" or "dismissed") or to
 * "unavailable" when no prompt was captured (e.g. iOS Safari, already
 * installed, or the browser never fired the event).
 *
 * @returns {Promise<string>} Platform outcome string
 */
export const promptInstall = async () => {
  if (!deferredPrompt) return "unavailable";
  deferredPrompt.prompt();
  const outcome = await deferredPrompt.userChoice;
  if (outcome.outcome === "accepted") {
    deferredPrompt = null;
    store.dispatch(setInstallable(false));
    store.dispatch(setInstalled(true));
  } else {
    store.dispatch(setInstallable(false));
  }
  return outcome.outcome;
};

/**
 * Whether the browser is known to support an install prompt.
 *
 * @returns {boolean} True when a prompt has been captured
 */
export const isInstallable = () => Boolean(deferredPrompt);

/**
 * Registers the beforeinstallprompt and appinstalled listeners.
 * Safe to call more than once: duplicate listeners are avoided by checking
 * the captured flag.
 *
 * @returns {void}
 */
export const setupInstallListeners = () => {
  if (setupInstallListeners.ready) return;
  setupInstallListeners.ready = true;

  window.addEventListener("beforeinstallprompt", captureInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
};
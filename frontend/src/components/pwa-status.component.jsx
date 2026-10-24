/**
 * @fileoverview PWA status component
 * Displays offline readiness, connectivity, and sync status info
 */

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  setSyncing,
  setSyncComplete,
  setSyncError,
} from "../store/slices/pwa.slice";
import { syncAll } from "../utils/pwa/sync-service.util";
import {
  flushPendingWrites,
  refreshWriteQueueSummary,
  clearFailedWrites,
} from "../utils/pwa/write-queue.util";

/**
 * Builds a short human readable summary of the last sync result
 *
 * @param {Object|null} counts - Counts returned by the last sync
 * @returns {string} e.g. "3 updated, 1 removed" or an empty string
 */
const describeSyncCounts = (counts) => {
  if (!counts) return "";

  const parts = [];
  const updated = (counts.songsSynced || 0) + (counts.albumsSynced || 0);
  const removed = (counts.songsRemoved || 0) + (counts.albumsRemoved || 0);

  if (updated > 0) parts.push(`${updated} updated`);
  if (removed > 0) parts.push(`${removed} removed`);

  return parts.join(", ");
};

/**
 * PWA Status Component
 *
 * Displays status banners for PWA functionality:
 * - "App ready for offline use" banner when the shell is cached
 * - Sync status bar with the last sync time and a manual sync button
 *
 * @component
 * @returns {JSX.Element} PWA status UI
 */
const PwaStatus = () => {
  const dispatch = useDispatch();
  const {
    offlineReady,
    isOnline,
    lastSyncTime,
    isSyncing,
    syncError,
    lastSyncCounts,
    pendingWrites,
    failedWrites,
  } = useSelector((state) => state.pwa);
  const localPlaylists = useSelector((state) => state.localPlaylists.localPlaylists);
  const unsyncedPlaylists = (localPlaylists || []).filter((p) => !p.synced).length;
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);

  const handleSyncNow = async () => {
    if (!navigator.onLine) return;
    try {
      dispatch(setSyncing(true));
      await flushPendingWrites();
      const result = await syncAll();
      dispatch(setSyncComplete(result));
    } catch (error) {
      dispatch(setSyncError(error?.message || "Sync failed."));
    } finally {
      refreshWriteQueueSummary().catch(() => {});
    }
  };

  const handleDiscardFailed = async () => {
    await clearFailedWrites();
    dispatch(setSyncing(false));
  };

  const handleDismissOffline = () => {
    setShowOfflineBanner(false);
  };

  const syncCounts = describeSyncCounts(lastSyncCounts);
  const showSyncBar =
    offlineReady ||
    Boolean(lastSyncTime) ||
    pendingWrites > 0 ||
    unsyncedPlaylists > 0;

  return (
    <>
      {offlineReady && showOfflineBanner && (
        <div className="bg-success-100 text-success-800 px-4 py-2 text-sm flex items-center justify-between">
          <span>App ready for offline use</span>
          <button
            onClick={handleDismissOffline}
            className="ml-4 text-success-800 font-bold hover:text-success-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {failedWrites > 0 && (
        <div className="bg-warning-100 text-warning-300 px-4 py-2 text-sm flex items-center justify-between">
          <span>
            {failedWrites} offline {failedWrites === 1 ? "change" : "changes"}{" "}
            could not be saved.
          </span>
          <button
            onClick={handleDiscardFailed}
            className="ml-4 font-bold hover:underline"
          >
            Discard
          </button>
        </div>
      )}

      {showSyncBar && (
        <div className="bg-neutrals-100 text-neutrals-700 px-4 py-1.5 text-xs flex items-center justify-between border-b border-neutrals-200">
          <span>
            {isSyncing
              ? "Syncing..."
              : lastSyncTime
                ? `Last synced: ${new Date(lastSyncTime).toLocaleString()}`
                : "Not yet synced"}
            {!isSyncing && syncCounts && (
              <span className="ml-2">({syncCounts})</span>
            )}
            {pendingWrites > 0 && (
              <span className="ml-2">
                {pendingWrites} {pendingWrites === 1 ? "change" : "changes"}{" "}
                pending
              </span>
            )}
            {!isOnline && (
              <span className="ml-2 text-neutrals-700">Offline</span>
            )}
            {syncError && (
              <span className="text-secondary ml-2">Sync error: {syncError}</span>
            )}
            {unsyncedPlaylists > 0 && (
              <span className="ml-2">Upload pending: {unsyncedPlaylists} local
              playlist{unsyncedPlaylists === 1 ? "" : "s"}</span>
            )}
          </span>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || !isOnline}
            title={isOnline ? "Sync now" : "Unavailable while offline"}
            className="px-2 py-0.5 text-xs bg-neutrals-200 rounded hover:bg-neutrals-400 disabled:opacity-50"
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      )}
    </>
  );
};

export default PwaStatus;

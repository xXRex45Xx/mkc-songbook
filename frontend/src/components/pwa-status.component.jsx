/**
 * @fileoverview PWA status component
 * Displays offline readiness, update availability, and sync status info
 */

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  setOfflineReady,
  setNeedRefresh,
  setSyncing,
  setSyncComplete,
  setSyncError,
} from "../store/slices/pwa.slice";
import { syncAll } from "../utils/pwa/sync-service.util";
import { updateSW } from "../utils/pwa/pwa-register.util";

/**
 * PWA Status Component
 *
 * Displays status banners for PWA functionality:
 * - "App ready for offline use" banner when offlineReady is true
 * - "Update available" toast when needRefresh is true
 * - Sync status bar showing last sync time and manual sync button
 *
 * @component
 * @returns {JSX.Element} PWA status UI
 */
const PwaStatus = () => {
  const dispatch = useDispatch();
  const { offlineReady, needRefresh, lastSyncTime, isSyncing, syncError } =
    useSelector((state) => state.pwa);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);

  const handleSyncNow = async () => {
    try {
      dispatch(setSyncing(true));
      const result = await syncAll();
      dispatch(setSyncComplete(result));
    } catch (error) {
      dispatch(setSyncError(error.message));
    }
  };

  const handleDismissOffline = () => {
    setShowOfflineBanner(false);
    dispatch(setOfflineReady(false));
  };

  const handleReload = () => {
    updateSW();
  };

  const handleDismissUpdate = () => {
    dispatch(setNeedRefresh(false));
  };

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

      {needRefresh && (
        <div className="bg-primary-100 text-primary-800 px-4 py-2 text-sm flex items-center justify-between">
          <span>New update available</span>
          <div className="flex gap-2">
            <button
              onClick={handleReload}
              className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-600"
            >
              Reload
            </button>
            <button
              onClick={handleDismissUpdate}
              className="px-3 py-1 text-primary-800 hover:text-primary-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {offlineReady && (
        <div className="bg-neutrals-100 text-neutrals-700 px-4 py-1.5 text-xs flex items-center justify-between border-b border-neutrals-200">
          <span>
            {isSyncing
              ? "Syncing..."
              : lastSyncTime
                ? `Last synced: ${new Date(lastSyncTime).toLocaleString()}`
                : "Not yet synced"}
            {syncError && (
              <span className="text-secondary ml-2">Sync error: {syncError}</span>
            )}
          </span>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="px-2 py-0.5 text-xs bg-neutrals-200 rounded hover:bg-neutrals-300 disabled:opacity-50"
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      )}
    </>
  );
};

export default PwaStatus;

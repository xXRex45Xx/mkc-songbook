/**
 * @fileoverview PWA status component
 * Displays offline readiness and failed offline write info
 */

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { setSyncing } from "../store/slices/pwa.slice";
import { clearFailedWrites } from "../utils/pwa/write-queue.util";

/**
 * PWA Status Component
 *
 * Displays status banners for PWA functionality:
 * - "App ready for offline use" banner when the shell is cached
 * - Failed offline writes banner with a discard action
 *
 * @component
 * @returns {JSX.Element} PWA status UI
 */
const PwaStatus = () => {
  const dispatch = useDispatch();
  const { offlineReady, failedWrites } = useSelector((state) => state.pwa);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);

  const handleDiscardFailed = async () => {
    await clearFailedWrites();
    dispatch(setSyncing(false));
  };

  const handleDismissOffline = () => {
    setShowOfflineBanner(false);
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
    </>
  );
};

export default PwaStatus;

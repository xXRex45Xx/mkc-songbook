/**
 * @fileoverview Download audio button component
 * Provides a download button for audio files with offline caching support
 */

import { useState } from "react";
import { Button } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import DownloadSvg from "../assets/download.svg?react";
import CustomTailSpin from "./custom-tail-spin.component";
import {
  downloadAudioFile,
  cacheAudioForOffline,
} from "../utils/api/audio-download.util";

/**
 * Download Audio Component
 *
 * Button that triggers audio file download for a user device and optionally
 * caches the audio in IndexedDB for in-app offline playback.
 * Uses File System Access API (showSaveFilePicker) when available for better UX,
 * falls back to blob URL + click.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.songId - Song identifier
 * @param {string} props.songTitle - Song title used for filename
 * @param {boolean} props.hasAudio - Whether the song has an audio file
 * @param {boolean} [props.showSaveOffline=true] - Whether to render the "Save offline" button
 * @param {string} [props.size="xxs"] - Button size
 * @returns {JSX.Element} Download button or loading spinner
 */
const DownloadAudio = ({
  songId,
  songTitle,
  hasAudio,
  showSaveOffline = true,
  size = "xxs",
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!hasAudio || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadAudioFile(songId, songTitle);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveOffline = async (e) => {
    e.stopPropagation();
    if (!hasAudio || isSavingOffline) return;
    setIsSavingOffline(true);
    try {
      await cacheAudioForOffline(songId);
    } catch (error) {
      console.error("Failed to cache audio for offline:", error);
    } finally {
      setIsSavingOffline(false);
    }
  };

  if (!hasAudio) {
    return (
      <Button
        className="border-none focus:ring-0 opacity-40 cursor-not-allowed"
        theme={buttonTheme}
        size={size}
        disabled
      >
        <DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
      </Button>
    );
  }

  if (isDownloading || isSavingOffline) {
    return <CustomTailSpin xs />;
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        className="border-none focus:ring-0"
        theme={buttonTheme}
        size={size}
        onClick={handleDownload}
        title="Download audio file"
      >
        <DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
      </Button>
      {showSaveOffline && (
        <Button
          className="border-none focus:ring-0"
          theme={buttonTheme}
          size={size}
          onClick={handleSaveOffline}
          title="Save for offline playback"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer"
          >
            <path d="M12 2a5 5 0 0 15 5v2.5a.5.5 0 0 1-1 0V7a4 4 0 0 0-8 0v.5a.5.5 0 0 1-1 0V7a5 5 0 0 15-5zM5.5 12.5a.5.5 0 0 1.5 0v5a.5.5 0 0 1-1 0v-5zM8 13a.5.5 0 0 1.5 0v4a.5.5 0 0 1-1 0v-4zM14 13a.5.5 0 0 1.5 0v4a.5.5 0 0 1-1 0v-4zM16.5 12.5a.5.5 0 0 1.5 0v5a.5.5 0 0 1-1 0v-5z" />
          </svg>
        </Button>
      )}
    </div>
  );
};

export default DownloadAudio;

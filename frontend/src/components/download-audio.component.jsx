/**
 * @fileoverview Download audio button component
 * One button that saves a song's audio for offline playback and downloads the
 * file to the device.
 */

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import DownloadSvg from "../assets/download.svg?react";
import CustomTailSpin from "./custom-tail-spin.component";
import { saveAndDownloadAudio } from "../utils/api/audio-download.util";
import { audioIdbService } from "../utils/db/audio-idb-service.util";

/**
 * Download Audio Component
 *
 * Single button carrying the download icon. Clicking it fetches the song's
 * audio once and produces both outcomes: the IndexedDB copy used for in-app
 * offline playback, and the file written to the device (File System Access API
 * when available, blob URL + anchor click otherwise). The IndexedDB copy is
 * written first, so offline playback survives a dismissed save dialog.
 *
 * Renders three UI states:
 * - "saving"     - save + download in progress (spinner)
 * - "downloaded" - audio already cached offline (filled icon)
 * - "available"  - default: unfilled download icon
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.songId - Song identifier
 * @param {string} props.songTitle - Song title used for filename
 * @param {boolean} props.hasAudio - Whether the song has an audio file
 * @param {string} [props.size="xxs"] - Button size
 * @returns {JSX.Element} Download button or loading spinner
 */
const DownloadAudio = ({ songId, songTitle, hasAudio, size = "xxs" }) => {
	const [isSaving, setIsSaving] = useState(false);
	const [isDownloaded, setIsDownloaded] = useState(false);

	/**
	 * On mount, check whether this song is already cached offline so the
	 * filled-icon indicator persists across remounts.
	 */
	useEffect(() => {
		if (!songId) return;
		let cancelled = false;
		audioIdbService.exists(songId).then((exists) => {
			if (!cancelled) setIsDownloaded(exists);
		});
		return () => {
			cancelled = true;
		};
	}, [songId]);

	const handleSaveAndDownload = async (e) => {
		e.stopPropagation();
		if (!hasAudio || isSaving) return;
		setIsSaving(true);
		try {
			await saveAndDownloadAudio(songId, songTitle);
			setIsDownloaded(true);
		} catch (error) {
			console.error("Failed to save and download audio:", error);
		} finally {
			setIsSaving(false);
		}
	};

	if (!hasAudio) {
		return (
			<Button
				className="border-none focus:ring-0 opacity-40 cursor-not-allowed"
				theme={buttonTheme}
				size={size}
				disabled
				title="No audio available for this song"
			>
				<DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
			</Button>
		);
	}

	if (isSaving) {
		return <CustomTailSpin xs />;
	}

	return (
		<Button
			className="border-none focus:ring-0"
			theme={buttonTheme}
			size={size}
			onClick={handleSaveAndDownload}
			title={
				isDownloaded
					? "Saved offline — tap to download the file again"
					: "Save offline and download audio file"
			}
		>
			<DownloadSvg
				className={`hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer ${
					isDownloaded ? "first:fill-success" : ""
				}`}
			/>
		</Button>
	);
};

export default DownloadAudio;

/**
 * @fileoverview Download audio button component
 * One button that saves a song's audio for offline playback.
 */

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import DownloadSvg from "../assets/download.svg?react";
import downloadDoneIcon from "../assets/download-done.svg";
import CustomTailSpin from "./custom-tail-spin.component";
import { saveAudioOffline } from "../utils/api/audio-download.util";
import { audioIdbService } from "../utils/db/audio-idb-service.util";
import {
	clearAudioDownload,
	setAudioDownloadProgress,
} from "../store/slices/pwa.slice";

/**
 * Download Audio Component
 *
 * Single button carrying the download icon. Clicking it fetches the song's
 * audio and stores the copy in IndexedDB for in-app offline playback. Nothing
 * is written to the device's files, so no save dialog opens.
 *
 * Renders three UI states:
 * - "saving"     - save in progress (spinner; the table row shows a progress bar)
 * - "downloaded" - audio already cached offline (check icon, button disabled)
 * - "available"  - default: download icon
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.songId - Song identifier
 * @param {boolean} props.hasAudio - Whether the song has an audio file
 * @param {string} [props.size="xxs"] - Button size
 * @returns {JSX.Element} Download button or loading spinner
 */
const DownloadAudio = ({ songId, hasAudio, size = "xxs" }) => {
	const dispatch = useDispatch();
	const [isSaving, setIsSaving] = useState(false);
	const [isDownloaded, setIsDownloaded] = useState(false);
	const lastPercent = useRef(-1);

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

	const handleSaveOffline = async (e) => {
		e.stopPropagation();
		if (!hasAudio || isSaving) return;
		setIsSaving(true);
		lastPercent.current = -1;
		dispatch(setAudioDownloadProgress({ songId, percent: 0 }));
		try {
			await saveAudioOffline(songId, (fraction) => {
				const percent = Math.floor(fraction * 100);
				if (percent === lastPercent.current) return;
				lastPercent.current = percent;
				dispatch(setAudioDownloadProgress({ songId, percent }));
			});
			setIsDownloaded(true);
		} catch (error) {
			console.error("Failed to save audio offline:", error);
		} finally {
			dispatch(clearAudioDownload(songId));
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

	if (isDownloaded) {
		return (
			<Button
				className="border-none focus:ring-0 cursor-default disabled:opacity-100"
				theme={buttonTheme}
				size={size}
				disabled
				title="Saved offline"
				aria-label="Saved offline"
			>
				<img src={downloadDoneIcon} alt="" />
			</Button>
		);
	}

	return (
		<Button
			className="border-none focus:ring-0"
			theme={buttonTheme}
			size={size}
			onClick={handleSaveOffline}
			title="Save audio for offline playback"
		>
			<DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
		</Button>
	);
};

export default DownloadAudio;

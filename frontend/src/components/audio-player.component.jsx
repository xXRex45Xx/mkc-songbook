/**
 * @fileoverview Audio player component for song playback
 * Provides playback controls, progress tracking, and favorites management
 */

import { useState, useRef, useEffect } from "react";
import AudioControls from "./audio-controls.component";

import CustomSlider from "./custom-slider.component";
import AudioPlayerToolbox from "./audio-player-toolbox.component";
import { useDispatch, useSelector } from "react-redux";
import backendURL from "../config/backend-url.config";
import {
	nextSong,
	prevSong,
	setCurrentSongIdx,
	toggleRepeat,
} from "../store/slices/playlist.slice";
import { useLocation, useNavigate } from "react-router-dom";
import { updateFavoriteSongs } from "../utils/api/user-api.util";
import { setUserFavorites } from "../store/slices/user.slice";
import {
	getOfflineAudioMeta,
	isAudioStale,
} from "../utils/api/audio-download.util";

/**
 * Audio Player Component
 *
 * A responsive audio player with playback controls and progress tracking.
 * Features:
 * - Progress slider with gradient background
 * - Time display (desktop only)
 * - Song title and album/artist information
 * - Playback controls via AudioControls
 * - Additional toolbox controls
 * - Favorite song management
 * - Responsive layout for mobile and desktop
 * - Redux integration for queue management
 *
 * @component
 * @returns {JSX.Element} Audio player with controls
 */
const AudioPlayer = () => {
	/**
	 * State for tracking playback progress
	 */
	const [sliderValue, setSliderValue] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [maxSliderValue, setMaxSliderValue] = useState(0);
	const [isAddingToFavorite, setIsAddingToFavorite] = useState(false);
	const [audioSrc, setAudioSrc] = useState("");
	const [audioUnavailable, setAudioUnavailable] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const queue = useSelector((state) => state.playlist.queue);
	const currentSongIdx = useSelector((state) => state.playlist.currentSongIdx);
	const repeat = useSelector((state) => state.playlist.repeat);
	const user = useSelector((state) => state.user.currentUser);
	const audioRef = useRef(null);
	// Blob URL currently assigned to the <audio> element.
	const blobUrlRef = useRef("");
	// Blob URL from the previous track, kept alive until the new source has
	// loaded so the element never loses its active URL mid-swap.
	const pendingBlobUrlRef = useRef("");

	/**
	 * Resolve the audio source for the current track.
	 * Always checks IndexedDB first (local-first), regardless of online state.
	 * Falls back to remote streaming when no local copy exists or the local
	 * copy is stale relative to the song record's updatedAt.
	 */
	const resolveAudioSrc = async (songId) => {
		// 1. Try local blob first (always, even offline).
		try {
			const meta = await getOfflineAudioMeta(songId);
			if (meta && meta.blob) {
				// 2. Check staleness against the song record's remote updatedAt.
				let stale = false;
				try {
					stale = await isAudioStale(songId);
				} catch (err) {
					console.warn("Staleness check failed, using local copy:", err);
				}
				if (!stale) {
					return URL.createObjectURL(meta.blob);
				}
			}
		} catch (err) {
			console.warn("Local audio lookup failed, falling back to stream:", err);
		}

		// 3. Fall back to remote streaming (Range-supported, no full download).
		return `${backendURL}/api/song/${songId}/audio`;
	};

	/**
	 * When a remote stream fails (network error), prefer a local cached copy
	 * if one exists. Used as a recovery path for the audio element's
	 * onError/onStalled handlers.
	 *
	 * @param {number} idx - Current song index in the queue
	 */
	const fallbackToLocalOnStreamError = async (idx) => {
		if (idx < 0 || !queue[idx]) return;
		const songId = queue[idx]._id;
		try {
			const meta = await getOfflineAudioMeta(songId);
			if (meta && meta.blob) {
				const url = URL.createObjectURL(meta.blob);
				// Hold the old blob alive until the new src is applied, so the
				// <audio> element never loses its active URL mid-swap.
				pendingBlobUrlRef.current = blobUrlRef.current;
				blobUrlRef.current = url;
				setAudioSrc(url);
			} else {
				setAudioUnavailable(true);
			}
		} catch (err) {
			console.warn("Stream error recovery failed:", err);
			setAudioUnavailable(true);
		}
	};

	const safePlay = () => {
		if (!audioRef.current) return;
		audioRef.current.play().catch((err) => {
			// Autoplay without a gesture is blocked by the browser; the play
			// button is the gesture, so this only surfaces real failures.
			if (err.name === "NotSupportedError") {
				setAudioUnavailable(true);
			}
		});
	};

	const onSrcLoaded = () => {
		// The new source is in use; revoke the blob URL that was held alive
		// during the swap, not the one the element is currently using.
		if (pendingBlobUrlRef.current) {
			URL.revokeObjectURL(pendingBlobUrlRef.current);
			pendingBlobUrlRef.current = "";
		}
	};

	// Revoke any blob URL still held alive when the player unmounts or the
	// queue drains, so a remote->blob swap that never fires onCanPlay cannot
	// leak the old URL.
	useEffect(() => {
		return () => {
			if (pendingBlobUrlRef.current) {
				URL.revokeObjectURL(pendingBlobUrlRef.current);
				pendingBlobUrlRef.current = "";
			}
			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
				blobUrlRef.current = "";
			}
		};
	}, []);

	useEffect(() => {
		const loadAudioSrc = async () => {
			if (currentSongIdx < 0 || !queue[currentSongIdx]) {
				setAudioSrc("");
				setAudioUnavailable(false);
				return;
			}
			const songId = queue[currentSongIdx]._id;
			setAudioUnavailable(false);
			const url = await resolveAudioSrc(songId);
			// Hold the old blob alive until onCanPlay fires, so the element
			// never loses its active URL mid-swap.
			pendingBlobUrlRef.current = blobUrlRef.current;
			blobUrlRef.current = url;
			setAudioSrc(url);
		};
		loadAudioSrc();
	}, [currentSongIdx, queue]);

	const handleTogglePlayPause = () => {
		if (!audioRef.current || currentSongIdx < 0 || queue.length === 0) return;
		audioRef.current.paused
			? safePlay()
			: audioRef.current.pause();
	};

	const formatTime = (seconds) => {
		if (!seconds) return "00:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const handleToggleFavorite = async () => {
		if (!user) return navigate(`/auth?redirect=${location.pathname}`);
		if (!queue[currentSongIdx]) return;
		setIsAddingToFavorite(true);
		try {
			if (!user.favorites) user.favorites = [];
			if (user.favorites.includes(queue[currentSongIdx]._id)) {
				await updateFavoriteSongs(null, null, [queue[currentSongIdx]._id]);
				dispatch(
					setUserFavorites(
						user.favorites.filter(
							(favSong) => favSong !== queue[currentSongIdx]._id
						)
					)
				);
			} else {
				await updateFavoriteSongs(null, [queue[currentSongIdx]._id]);
				dispatch(
					setUserFavorites(
						user.favorites.concat([queue[currentSongIdx]._id])
					)
				);
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setIsAddingToFavorite(false);
		}
	};

	return (
		<div className="p-px bg-gradient-to-r from-secondary to-primary">
			<div className="flex flex-col flex-nowrap bg-basewhite">
				<CustomSlider
					max={maxSliderValue}
					onChange={(e) => {
						if (audioRef.current)
							audioRef.current.currentTime = e.target.value;
					}}
					value={sliderValue}
					show
				/>
				<div className="flex flex-col px-5 md:px-10 py-3.5 md:pt-3.5 md:pb-7 items-stretch">
					<div className="hidden md:flex justify-between">
						<span className="text-neutrals-700 text-sm font-bold">
							{audioRef.current &&
								formatTime(audioRef.current.currentTime)}
						</span>
						<span className="text-neutrals-700 text-sm font-bold">
							{audioRef.current && formatTime(audioRef.current.duration)}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex flex-col items-stretch gap-1.5 ">
							<span className="text-xs md:text-lg font-semibold text-baseblack">
								{queue[currentSongIdx]?.title}
							</span>
							<span className="text-[0.625rem] md:text-sm font-semibold text-neutrals-700">
								{queue[currentSongIdx]?.albums
									.map((album) => album.name)
									.join(",")}
							</span>
						</div>
						<AudioControls
							onPlayPause={handleTogglePlayPause}
							isPlaying={isPlaying}
							onNext={() => dispatch(nextSong())}
							onPrev={() => {
								if (audioRef.current.currentTime < 3)
									return dispatch(prevSong());
								setSliderValue(0);
								if (audioRef.current.paused) safePlay();
							}}
							onToggleFav={handleToggleFavorite}
							toggleFavProcessing={isAddingToFavorite}
							songInFav={user?.favorites.includes(
								queue[currentSongIdx]?._id
							)}
							repeat={repeat}
							onToggleRepeat={() => dispatch(toggleRepeat())}
						/>
						<AudioPlayerToolbox />
					</div>
					{audioUnavailable && (
						<div className="text-xs text-error-300 mt-2">
							Audio not saved for offline playback. Save it from the
							download button to listen while offline.
						</div>
					)}
				</div>
			</div>
			<audio
				hidden
				ref={audioRef}
				src={audioSrc || undefined}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
				onCanPlay={onSrcLoaded}
				onTimeUpdate={(e) => {
					setSliderValue(Math.floor(e.target.currentTime));
				}}
				onEnded={() => {
					setIsPlaying(false);
					if (repeat === "repeat-current") return safePlay();
					if (currentSongIdx < queue.length - 1)
						return dispatch(nextSong());
					if (repeat === "repeat-all") dispatch(setCurrentSongIdx(0));
				}}
				onStalled={() => {
					setIsPlaying(false);
					// If streaming failed and a local copy exists, prefer it.
					if (audioSrc && audioSrc.startsWith(backendURL)) {
						fallbackToLocalOnStreamError(currentSongIdx);
					}
				}}
				onError={() => {
					setIsPlaying(false);
					// If streaming failed and a local copy exists, prefer it.
					if (audioSrc && audioSrc.startsWith(backendURL)) {
						fallbackToLocalOnStreamError(currentSongIdx);
					}
				}}
				onDurationChange={(e) => {
					setMaxSliderValue(Math.floor(e.target.duration));
				}}
				{...(audioSrc && !audioSrc.startsWith("blob:")
					? { crossOrigin: "anonymous" }
					: {})}
			/>
		</div>
	);
};

export default AudioPlayer;

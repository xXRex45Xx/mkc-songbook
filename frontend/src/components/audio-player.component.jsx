import { useState, useRef } from "react";
import AudioControls from "./audio-controls.component";
import tmpAudio from "../assets/tmp-audio.mp3";

import CustomSlider from "./custom-slider.component";
import AudioPlayerToolbox from "./audio-player-toolbox.component";
import { useSelector } from "react-redux";
import backendURL from "../config/backend-url.config";

/**
 * Audio Player Component
 *
 * A responsive audio player with playback controls and progress tracking.
 * Features:
 * - Progress slider with gradient background
 * - Time display (desktop only)
 * - Song title and album/artist information
 * - Playback controls
 * - Additional toolbox controls
 * - Responsive layout for mobile and desktop
 */
const AudioPlayer = () => {
	/**
	 * State for tracking playback progress
	 */
	const [sliderValue, setSliderValue] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [maxSliderValue, setMaxSliderValue] = useState(0);
	const queue = useSelector((state) => state.playlist.queue);
	const currentSongIdx = useSelector((state) => state.playlist.currentSongIdx);

	const audioRef = useRef(null);

	const handleTogglePlayPause = () => {
		if (!audioRef.current || currentSongIdx < 0 || queue.length === 0) return;
		audioRef.current.paused
			? audioRef.current.play()
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
								Amazing Grace
							</span>
							<span className="text-[0.625rem] md:text-sm font-semibold text-neutrals-700">
								Hayley Westenra/[Album Name]
							</span>
						</div>
						<AudioControls
							onPlayPause={handleTogglePlayPause}
							isPlaying={isPlaying}
						/>
						<AudioPlayerToolbox />
					</div>
				</div>
			</div>
			<audio
				hidden
				ref={audioRef}
				src={
					currentSongIdx >= 0 && currentSongIdx < queue.length
						? `${backendURL}/api/song/${queue[currentSongIdx]._id}/audio`
						: undefined
				}
				// src={tmpAudio}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
				onTimeUpdate={(e) => {
					setSliderValue(Math.floor(e.target.currentTime));
				}}
				onEnded={() => setIsPlaying(false)}
				onStalled={() => setIsPlaying(false)}
				onDurationChange={(e) => {
					setMaxSliderValue(Math.floor(e.target.duration));
					console.log(e.target.duration);
				}}
				crossOrigin="anonymous"
			/>
		</div>
	);
};

export default AudioPlayer;

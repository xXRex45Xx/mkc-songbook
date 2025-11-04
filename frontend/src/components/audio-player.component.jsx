import { useState } from "react";
import AudioControls from "./audio-controls.component";

import CustomSlider from "./custom-slider.component";
import AudioPlayerToolbox from "./audio-player-toolbox.component";

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
	const maxSliderValue = 100;

	return (
		<div className="p-px bg-gradient-to-r from-secondary to-primary">
			<div className="flex flex-col flex-nowrap bg-basewhite">
				<CustomSlider
					max={maxSliderValue}
					onChange={(e) => setSliderValue(e.target.value)}
					value={sliderValue}
				/>
				<div className="flex flex-col px-5 md:px-10 py-3.5 md:pt-3.5 md:pb-7 items-stretch">
					<div className="hidden md:flex justify-between">
						<span className="text-neutrals-700 text-sm font-bold">
							3:30
						</span>
						<span className="text-neutrals-700 text-sm font-bold">
							5:50
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
						<AudioControls />
						<AudioPlayerToolbox />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AudioPlayer;

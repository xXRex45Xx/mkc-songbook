import { Tooltip, Button, Popover } from "flowbite-react";
import CustomSlider from "./custom-slider.component";
import { useDispatch, useSelector } from "react-redux";
import { setLyricsFontSize } from "../store/slices/configs.slice";
import { buttonTheme } from "../config/button-theme.config";

import TextSizeSvg from "../assets/text-size.svg?react";
import PresentationSvg from "../assets/presentation.svg?react";
import QueueSvg from "../assets/queue.svg?react";

/**
 * Audio Player Toolbox Component
 *
 * Additional controls and settings for the audio player.
 * Desktop-only component that provides presentation mode,
 * lyrics font size adjustment, and queue management.
 *
 * Features:
 * - Presentation mode toggle with tooltip
 * - Font size adjustment with slider (9-60pts)
 * - Queue management with tooltip
 * - Popover for font size adjustment
 * - Redux integration for font size persistence
 * - Responsive hover and active states
 */
const AudioPlayerToolbox = () => {
	return (
		<div className="hidden md:flex px-5 justify-center items-center gap-7">
			<Tooltip content="Queue">
				<Button
					className="focus:ring-0"
					theme={buttonTheme}
					positionInGroup="end"
					size="xxs"
				>
					<QueueSvg className="first:stroke-baseblack last:stroke-baseblack hover:first:stroke-neutrals-1000 hover:second:stroke-neutrals-1000 active:first:stroke-neutrals-baseblack active:second:stroke-neutrals-1000" />
				</Button>
			</Tooltip>
		</div>
	);
};

export default AudioPlayerToolbox;

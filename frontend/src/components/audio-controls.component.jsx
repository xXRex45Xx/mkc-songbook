import { Button } from "flowbite-react";
import HeartSvg from "../assets/heart.svg?react";
import PreviousSvg from "../assets/previous.svg?react";
import PlaySvg from "../assets/play.svg?react";
import NextSvg from "../assets/next.svg?react";
import RepeatSvg from "../assets/repeat.svg?react";
import PauseSvg from "../assets/pause.svg?react";
import { buttonGroupTheme, buttonTheme } from "../config/button-theme.config";

/**
 * Audio Controls Component
 *
 * Provides playback control buttons for the audio player.
 * Features:
 * - Like/favorite button (always visible)
 * - Previous track button (desktop only)
 * - Play/pause button (always visible)
 * - Next track button (always visible)
 * - Repeat button (desktop only)
 * - Responsive sizing for mobile and desktop layouts
 * - Hover and active state styling
 */
const AudioControls = ({ onPlayPause, isPlaying }) => (
	<Button.Group className="self-center" theme={buttonGroupTheme}>
		<Button
			className="order-2 md:order-none focus:ring-0"
			theme={buttonTheme}
			positionInGroup="start"
			size="xxs"
		>
			<HeartSvg className="w-5 h-5 md:w-6 md:h-6 first:stroke-baseblack first:fill-basewhite hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer" />
		</Button>
		<Button
			className="hidden md:flex focus:ring-0"
			theme={buttonTheme}
			positionInGroup="middle"
			size="xxs"
		>
			<PreviousSvg className="first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
		</Button>
		<Button
			className="order-1 md:order-none focus:ring-0"
			theme={buttonTheme}
			positionInGroup="middle"
			size="xxs"
			onClick={onPlayPause}
		>
			{isPlaying ? (
				<PauseSvg className="w-[1.875rem] h-[1.875rem] md:w-[3.75rem] md:h-[3.75rem] first:fill-secondary hover:first:fill-secondary-600 active:first:fill-secondary-700" />
			) : (
				<PlaySvg className="w-[1.875rem] h-[1.875rem] md:w-[3.75rem] md:h-[3.75rem] first:fill-secondary hover:first:fill-secondary-600 active:first:fill-secondary-700" />
			)}
		</Button>
		<Button
			className="order-3 md:order-none focus:ring-0"
			theme={buttonTheme}
			positionInGroup="middle"
			size="xxs"
		>
			<NextSvg className="w-5 h-5 md:w-6 md:h-6 first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
		</Button>
		<Button
			className="hidden md:flex focus:ring-0"
			theme={buttonTheme}
			positionInGroup="end"
			size="xxs"
		>
			<RepeatSvg className="first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
		</Button>
	</Button.Group>
);

export default AudioControls;

/**
 * @fileoverview Audio controls component for playback buttons
 * Provides play/pause, next/previous, repeat, and favorite controls
 */

import { Button } from "flowbite-react";
import HeartSvg from "../assets/heart.svg?react";
import PreviousSvg from "../assets/previous.svg?react";
import PlaySvg from "../assets/play.svg?react";
import NextSvg from "../assets/next.svg?react";
import RepeatSvg from "../assets/repeat.svg?react";
import RepeatOneSvg from "../assets/repeat-one.svg?react";
import PauseSvg from "../assets/pause.svg?react";
import { buttonGroupTheme, buttonTheme } from "../config/button-theme.config";
import CustomTailSpin from "./custom-tail-spin.component";
import { useMemo } from "react";

/**
 * Audio Controls Component
 *
 * Provides playback control buttons for the audio player.
 * Features:
 * - Like/favorite button (always visible)
 * - Previous track button (desktop, or mobile when expanded)
 * - Play/pause button (always visible)
 * - Next track button (always visible)
 * - Repeat button (desktop, or mobile when expanded)
 * - Natural left-to-right order and full-width spacing when expanded
 * - Responsive sizing for mobile and desktop layouts
 * - Hover and active state styling
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onPlayPause - Play/pause handler
 * @param {boolean} props.isPlaying - Whether audio is playing
 * @param {Function} props.onNext - Next track handler
 * @param {Function} props.onPrev - Previous track handler
 * @param {Function} props.onToggleRepeat - Repeat mode handler
 * @param {Function} props.onToggleFav - Favorite toggle handler
 * @param {boolean} props.songInFav - Whether the current song is a favorite
 * @param {boolean} props.toggleFavProcessing - Whether a favorite update is in flight
 * @param {string} props.repeat - Repeat mode
 * @param {boolean} [props.expanded=false] - Mobile expanded player: show every button
 * @returns {JSX.Element} Playback control button group
 */
const AudioControls = ({
	onPlayPause,
	isPlaying,
	onNext,
	onPrev,
	onToggleRepeat,
	onToggleFav,
	songInFav,
	toggleFavProcessing,
	repeat,
	expanded = false,
}) => {
	const favoriteIconStyle = useMemo(() => {
		let style =
			"w-5 h-5 md:w-6 md:h-6 hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer ";
		if (songInFav) style += "first:stroke-basewhite first:fill-primary";
		else style += "first:stroke-baseblack first:fill-basewhite";
		return style;
	}, [songInFav]);

	const repeatIconStyle = useMemo(() => {
		if (repeat === "no-repeat")
			return "first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack";
		return "first:fill-secondary-600 hover:first:fill-secondary-400 active:first:fill-secondary-600";
	}, [repeat]);
	return (
		<Button.Group
			className={expanded ? "w-full justify-between" : "self-center"}
			theme={buttonGroupTheme}
		>
			{toggleFavProcessing ? (
				<CustomTailSpin small />
			) : (
				<Button
					className={`${expanded ? "" : "order-2"} md:order-none focus:ring-0`}
					theme={buttonTheme}
					positionInGroup="start"
					size="xxs"
					onClick={onToggleFav}
				>
					<HeartSvg className={favoriteIconStyle} />
				</Button>
			)}
			<Button
				className={`${expanded ? "flex" : "hidden"} md:flex focus:ring-0`}
				theme={buttonTheme}
				positionInGroup="middle"
				size="xxs"
				onClick={onPrev}
			>
				<PreviousSvg className="first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
			</Button>
			<Button
				className={`${expanded ? "" : "order-1"} md:order-none focus:ring-0`}
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
				className={`${expanded ? "" : "order-3"} md:order-none focus:ring-0`}
				theme={buttonTheme}
				positionInGroup="middle"
				size="xxs"
				onClick={onNext}
			>
				<NextSvg className="w-5 h-5 md:w-6 md:h-6 first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
			</Button>
			<Button
				className={`${expanded ? "flex" : "hidden"} md:flex focus:ring-0`}
				theme={buttonTheme}
				positionInGroup="end"
				size="xxs"
				onClick={onToggleRepeat}
			>
				{repeat === "repeat-current" ? (
					<RepeatOneSvg />
				) : (
					<RepeatSvg className={repeatIconStyle} />
				)}
			</Button>
		</Button.Group>
	);
};

export default AudioControls;

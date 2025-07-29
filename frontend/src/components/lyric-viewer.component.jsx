import { Card, Button, Tooltip, Popover } from "flowbite-react";

import { buttonTheme } from "../config/button-theme.config";
import MusicElement from "./music-element.component";

import BackSvg from "../assets/back.svg?react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { regexBuilder } from "../utils/amharic-map.util";
import {
	setHiddenHeader,
	setLyricsFontSize,
	toggleHiddenHeader,
} from "../store/slices/configs.slice";

import CustomSlider from "./custom-slider.component";
import TextSizeSvg from "../assets/text-size.svg?react";
import ExitFullscreenSvg from "../assets/exit-fullscreen.svg?react";
import EnterFullscreenSvg from "../assets/enter-fullscreen.svg?react";

/**
 * Lyric Viewer Component
 *
 * Displays song lyrics with music elements and search highlighting.
 * Features:
 * - Back navigation button
 * - Song title display
 * - Music elements (chord, tempo, rhythm) display
 * - Configurable lyrics font size
 * - Search term highlighting with Amharic character support
 * - Whitespace preservation for lyrics formatting
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.song - Song object containing lyrics and metadata
 * @param {string} props.song.title - Song title
 * @param {string} props.song.lyrics - Song lyrics text
 * @param {Object} [props.song.musicElements] - Optional music elements
 * @param {string} [props.song.musicElements.chord] - Song chord notation
 * @param {number} [props.song.musicElements.tempo] - Song tempo
 * @param {string} [props.song.musicElements.rythm] - Song rhythm pattern
 */
const LyricViewer = ({ song }) => {
	const navigate = useNavigate();
	const [searchParams, _setSearchParams] = useSearchParams();
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setHiddenHeader(true));
		document.documentElement.requestFullscreen();
		return () => {
			dispatch(setHiddenHeader(false));
			document.exitFullscreen();
		};
	}, []);

	/**
	 * Font size configuration from Redux store
	 */
	const lyricsFontSize = useSelector((state) => state.configs.lyricsFontSize);
	const hiddenHeader = useSelector((state) => state.configs.hiddenHeader);

	/**
	 * Memoized regex pattern for search term highlighting
	 * Supports Amharic character variations through regexBuilder
	 */
	const regex = useMemo(() => {
		if (searchParams.get("q"))
			return new RegExp(regexBuilder(`(${searchParams.get("q")})`), "gi");
		return null;
	}, [searchParams]);

	const handleToggleFullscreen = () => {
		dispatch(toggleHiddenHeader());
		if (!document.fullscreenElement)
			document.documentElement.requestFullscreen();
		else document.exitFullscreen();
	};

	return (
		<>
			<Card
				theme={{
					root: {
						children: "flex justify-between items-center",
					},
				}}
				className="shadow-none py-4 pl-2.5 rounded-none border-x-0 border-t-0 border-b-neutrals-500 self-stretch"
			>
				<Button
					className="w-8 border-none focus:ring-0"
					theme={buttonTheme}
					size="xxs"
					onClick={() => navigate(-1)}
				>
					<BackSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				</Button>

				<h1 className="text-baseblack font-bold text-2xl ml-auto">
					{song.title}
				</h1>
				<div className="ml-auto flex items-center gap-12">
					{song.musicElements?.chord && (
						<MusicElement type="chord" detail={song.musicElements.chord} />
					)}
					{song.musicElements?.tempo && (
						<MusicElement type="tempo" detail={song.musicElements.tempo} />
					)}
					{song.musicElements?.rythm && (
						<MusicElement type="rythm" detail={song.musicElements.rythm} />
					)}
					<Tooltip content="Font Size">
						<Popover
							aria-labelledby="default-popover"
							content={
								<div className="w-64 text-sm text-gray-500 dark:text-gray-400">
									<div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
										<h3
											id="default-popover"
											className="font-semibold text-gray-900 dark:text-white"
										>
											Font Size
										</h3>
									</div>
									<div className="flex flex-col gap-3 py-5">
										<CustomSlider
											min="9"
											max="60"
											step="1"
											value={lyricsFontSize}
											onChange={(e) =>
												dispatch(setLyricsFontSize(e.target.value))
											}
										/>
										<span className="text-baseblack text-center font-medium text-base">
											{lyricsFontSize}pts
										</span>
									</div>
								</div>
							}
						>
							<Button className="focus:ring-0" theme={buttonTheme} size="xxs">
								<TextSizeSvg className="*:stroke-baseblack hover:*:stroke-neutrals-1000 active:*:stroke-baseblack" />
							</Button>
						</Popover>
					</Tooltip>
					<Tooltip
						content={hiddenHeader ? "Exit Fullscreen" : "Enter Fullscreen"}
					>
						<Button
							className="focus:ring-0"
							theme={buttonTheme}
							size="xxs"
							onClick={handleToggleFullscreen}
						>
							{hiddenHeader ? (
								<ExitFullscreenSvg className="fill-baseblack hover:fill-neutrals-1000 active:fill-baseblack" />
							) : (
								<EnterFullscreenSvg className="fill-baseblack hover:fill-neutrals-1000 active:fill-baseblack" />
							)}
						</Button>
					</Tooltip>
				</div>
			</Card>
			<p
				style={{ fontSize: `${lyricsFontSize}pt` }}
				className={`justify-center self-center text-baseblack font-bold whitespace-pre`}
			>
				{searchParams.get("q")
					? song.lyrics.split(regex).map((part) => {
							return regex.test(part) ? (
								<span className="bg-primary rounded-md">{part}</span>
							) : (
								part
							);
					  })
					: song.lyrics}
			</p>
		</>
	);
};

export default LyricViewer;

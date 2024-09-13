import { Button, Popover, Tooltip } from "flowbite-react";
import { useState } from "react";
import AudioControls from "./audio-controls.component";

import TextSizeSvg from "../assets/text-size.svg?react";
import PresentationSvg from "../assets/presentation.svg?react";
import PlaylistSvg from "../assets/playlist.svg?react";

import "./audio-player.styles.css";
import { buttonTheme } from "../config/button-theme.config";
import { useDispatch, useSelector } from "react-redux";
import { setLyricsFontSize } from "../store/slices/configs.slice";
import CustomSlider from "./custom-slider.component";

const AudioPlayer = () => {
    const dispatch = useDispatch();
    const [sliderValue, setSliderValue] = useState(0);
    const maxSliderValue = 100;
    const lyricsFontSize = useSelector((state) => state.configs.lyricsFontSize);
    return (
        <div className="p-px bg-gradient-to-r from-secondary to-primary">
            <div className="flex flex-col flex-nowrap bg-basewhite">
                <CustomSlider
                    max={maxSliderValue}
                    onChange={(e) => setSliderValue(e.target.value)}
                    value={sliderValue}
                />
                <div className="flex flex-col px-10 pt-3.5 pb-7 items-stretch">
                    <div className="flex justify-between">
                        <span className="text-neutrals-700 text-sm font-bold">
                            3:30
                        </span>
                        <span className="text-neutrals-700 text-sm font-bold">
                            5:50
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col items-stretch gap-1.5 ">
                            <span className="text-lg font-semibold text-baseblack">
                                Amazing Grace
                            </span>
                            <span className="text-sm font-semibold text-neutrals-700">
                                Hayley Westenra/[Album Name]
                            </span>
                        </div>
                        <AudioControls />
                        <div className="flex px-5 justify-center items-center gap-7">
                            <Tooltip content="Presentation Mode">
                                <Button
                                    className="focus:ring-0"
                                    theme={buttonTheme}
                                    positionInGroup="start"
                                    size="xxs"
                                >
                                    <PresentationSvg className="*:stroke-baseblack hover:*:stroke-neutrals-1000 active:*:stroke-neutrals-baseblack" />
                                </Button>
                            </Tooltip>
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
                                                        dispatch(
                                                            setLyricsFontSize(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                                <span className="text-baseblack text-center font-medium text-base">
                                                    {lyricsFontSize}pts
                                                </span>
                                            </div>
                                        </div>
                                    }
                                >
                                    <Button
                                        className="focus:ring-0"
                                        theme={buttonTheme}
                                        positionInGroup="middle"
                                        size="xxs"
                                    >
                                        <TextSizeSvg className="*:stroke-baseblack hover:*:stroke-neutrals-1000 active:*:stroke-neutrals-baseblack" />
                                    </Button>
                                </Popover>
                            </Tooltip>

                            <Tooltip content="Playlist">
                                <Button
                                    className="focus:ring-0"
                                    theme={buttonTheme}
                                    positionInGroup="end"
                                    size="xxs"
                                >
                                    <PlaylistSvg className="first:stroke-baseblack last:stroke-baseblack hover:first:stroke-neutrals-1000 hover:second:stroke-neutrals-1000 active:first:stroke-neutrals-baseblack active:second:stroke-neutrals-1000" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;

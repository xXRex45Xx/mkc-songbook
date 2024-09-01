import { Button, RangeSlider } from "flowbite-react";
import { useState } from "react";
import AudioControls from "./audio-controls.component";

import TextSizeSvg from "../assets/text-size.svg?react";
import PresentationSvg from "../assets/presentation.svg?react";
import PlaylistSvg from "../assets/playlist.svg?react";

import "./audio-player.styles.css";
import { buttonGroupTheme, buttonTheme } from "../config/button-theme.config";

const AudioPlayer = () => {
    const [sliderValue, setSliderValue] = useState(0);
    const maxSliderValue = 100;

    return (
        <div className="p-px bg-gradient-to-r from-secondary to-primary">
            <div className="flex flex-col flex-nowrap bg-basewhite">
                <RangeSlider
                    size="md"
                    value={sliderValue}
                    max={maxSliderValue}
                    onChange={(e) => setSliderValue(e.target.value)}
                    theme={{
                        root: {
                            base: "flex",
                        },
                        field: {
                            base: "relative w-full",
                            input: {
                                base: "-translate-y-1/2 absolute z-10 [&::-moz-range-progress]:h-0 w-full cursor-pointer appearance-none rounded-lg bg-transparent",
                            },
                        },
                    }}
                />
                <div
                    style={{
                        width: (sliderValue * 100) / maxSliderValue + "%",
                    }}
                    className="absolute left-0 -translate-y-1/2 h-2 bg-gradient-to-r from-secondary to-primary"
                ></div>
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
                        <Button.Group theme={buttonGroupTheme}>
                            <Button
                                className="focus:ring-0"
                                theme={buttonTheme}
                                positionInGroup="start"
                                size="xxs"
                            >
                                <PresentationSvg className="*:stroke-baseblack hover:*:stroke-neutrals-1000 active:*:stroke-neutrals-baseblack" />
                            </Button>
                            <Button
                                className="focus:ring-0"
                                theme={buttonTheme}
                                positionInGroup="middle"
                                size="xxs"
                            >
                                <TextSizeSvg className="*:stroke-baseblack hover:*:stroke-neutrals-1000 active:*:stroke-neutrals-baseblack" />
                            </Button>
                            <Button
                                className="focus:ring-0"
                                theme={buttonTheme}
                                positionInGroup="end"
                                size="xxs"
                            >
                                <PlaylistSvg className="first:stroke-baseblack last:stroke-baseblack hover:first:stroke-neutrals-1000 hover:second:stroke-neutrals-1000 active:first:stroke-neutrals-baseblack active:second:stroke-neutrals-1000" />
                            </Button>
                        </Button.Group>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;

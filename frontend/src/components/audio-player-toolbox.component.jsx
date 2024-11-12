import { Tooltip, Button, Popover } from "flowbite-react";
import CustomSlider from "./custom-slider.component";
import { useDispatch, useSelector } from "react-redux";
import { setLyricsFontSize } from "../store/slices/configs.slice";
import { buttonTheme } from "../config/button-theme.config";

import TextSizeSvg from "../assets/text-size.svg?react";
import PresentationSvg from "../assets/presentation.svg?react";
import QueueSvg from "../assets/queue.svg?react";

const AudioPlayerToolbox = () => {
    const dispatch = useDispatch();
    const lyricsFontSize = useSelector((state) => state.configs.lyricsFontSize);

    return (
        <div className="hidden md:flex px-5 justify-center items-center gap-7">
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
                                            setLyricsFontSize(e.target.value)
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

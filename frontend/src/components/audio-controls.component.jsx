import { Button } from "flowbite-react";
import HeartSvg from "../assets/heart.svg?react";
import PreviousSvg from "../assets/previous.svg?react";
import PlaySvg from "../assets/play.svg?react";
import NextSvg from "../assets/next.svg?react";
import RepeatSvg from "../assets/repeat.svg?react";
import { buttonGroupTheme, buttonTheme } from "../config/button-theme.config";

const AudioControls = () => (
    <Button.Group className="self-center" theme={buttonGroupTheme}>
        <Button
            className="focus:ring-0"
            theme={buttonTheme}
            positionInGroup="start"
            size="xxs"
        >
            <HeartSvg className="first:stroke-baseblack first:fill-basewhite hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer" />
        </Button>
        <Button
            className="focus:ring-0"
            theme={buttonTheme}
            positionInGroup="middle"
            size="xxs"
        >
            <PreviousSvg className="first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
        </Button>
        <Button
            className="focus:ring-0"
            theme={buttonTheme}
            positionInGroup="middle"
            size="xxs"
        >
            <PlaySvg className="first:fill-secondary hover:first:fill-secondary-600 active:first:fill-secondary-700" />
        </Button>
        <Button
            className="focus:ring-0"
            theme={buttonTheme}
            positionInGroup="middle"
            size="xxs"
        >
            <NextSvg className="first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
        </Button>
        <Button
            className="focus:ring-0"
            theme={buttonTheme}
            positionInGroup="end"
            size="xxs"
        >
            <RepeatSvg className="first:fill-baseblack hover:first:fill-neutrals-1000 active:first:fill-baseblack" />
        </Button>
    </Button.Group>
);

export default AudioControls;

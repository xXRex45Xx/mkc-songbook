import { Card, Button } from "flowbite-react";

import { buttonTheme } from "../config/button-theme.config";
import MusicElement from "./music-element.component";

import BackSvg from "../assets/back.svg?react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { regexBuilder } from "../../../backend/utils/amharic-map.util";

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

    /**
     * Font size configuration from Redux store
     */
    const lyricsFontSize = useSelector((state) => state.configs.lyricsFontSize);

    /**
     * Memoized regex pattern for search term highlighting
     * Supports Amharic character variations through regexBuilder
     */
    const regex = useMemo(() => {
        if (searchParams.get("q"))
            return new RegExp(regexBuilder(`(${searchParams.get("q")})`), "gi");
        return null;
    }, [searchParams]);

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
                        <MusicElement
                            type="chord"
                            detail={song.musicElements.chord}
                        />
                    )}
                    {song.musicElements?.tempo && (
                        <MusicElement
                            type="tempo"
                            detail={song.musicElements.tempo}
                        />
                    )}
                    {song.musicElements?.rythm && (
                        <MusicElement
                            type="rythm"
                            detail={song.musicElements.rythm}
                        />
                    )}
                </div>
            </Card>
            <p
                style={{ fontSize: `${lyricsFontSize}pt` }}
                className={`justify-center self-center text-baseblack font-bold whitespace-pre`}
            >
                {searchParams.get("q")
                    ? song.lyrics.split(regex).map((part) => {
                          return regex.test(part) ? (
                              <span className="bg-primary rounded-md">
                                  {part}
                              </span>
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

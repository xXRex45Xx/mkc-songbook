import { Card, Button } from "flowbite-react";

import { buttonTheme } from "../config/button-theme.config";
import MusicElement from "./music-element.component";

import BackSvg from "../assets/back.svg?react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { regexBuilder } from "../../../backend/utils/amharic-map.util";

const LyricViewer = ({ song }) => {
    const navigate = useNavigate();
    const [searchParams, _setSearchParams] = useSearchParams();
    const lyricsFontSize = useSelector((state) => state.configs.lyricsFontSize);

    const regex = useMemo(() => {
        if (searchParams.get("q"))
            return new RegExp(regexBuilder(`(${searchParams.get("q")})`), "gi");
        return null;
    }, [searchParams]);

    console.log(regex);
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
                    {song.musicElements.chord && (
                        <MusicElement
                            type="chord"
                            detail={song.musicElements.chord}
                        />
                    )}
                    {song.musicElements.tempo && (
                        <MusicElement
                            type="tempo"
                            detail={song.musicElements.tempo}
                        />
                    )}
                    {song.musicElements.rythm && (
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
                          console.log(part);
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

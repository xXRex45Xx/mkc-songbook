import {
    useLoaderData,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Button, Card } from "flowbite-react";

import BackSvg from "../assets/back.svg?react";
import { buttonTheme } from "../config/button-theme.config";
import MusicElement from "../components/music-element.component";
import { getSong } from "../utils/api/songs-api.util";
import { regexBuilder } from "../../../backend/utils/amharic-map.util";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const LyricsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const songData = useLoaderData();
    const [searchParams, _setSearchParams] = useSearchParams();
    const lyricsFontSize = useSelector((state) => state.configs.lyricsFontSize);

    const regex = useMemo(() => {
        if (searchParams.get("q"))
            return new RegExp(regexBuilder(`(${searchParams.get("q")})`), "gi");
        else return null;
    }, [searchParams]);
    return (
        <MainBodyContainer>
            <Card
                theme={{
                    root: {
                        children: "flex justify-between items-center",
                    },
                }}
                className="shadow-none py-4 pl-2.5 rounded-none border-x-0 border-t-0 border-b-neutrals-500 self-stretch"
            >
                {location.state && location.state.prevLocation && (
                    <Button
                        className="w-8 border-none focus:ring-0"
                        theme={buttonTheme}
                        size="xxs"
                        onClick={() => navigate(location.state.prevLocation)}
                    >
                        <BackSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
                    </Button>
                )}
                <h1 className="text-baseblack font-bold text-2xl ml-auto">
                    {songData.title}
                </h1>
                <div className="ml-auto flex items-center gap-12">
                    {songData.musicElements.chord && (
                        <MusicElement
                            type="chord"
                            detail={songData.musicElements.chord}
                        />
                    )}
                    {songData.musicElements.tempo && (
                        <MusicElement
                            type="tempo"
                            detail={songData.musicElements.tempo}
                        />
                    )}
                    {songData.musicElements.rythm && (
                        <MusicElement
                            type="rythm"
                            detail={songData.musicElements.rythm}
                        />
                    )}
                </div>
            </Card>
            <p
                style={{ fontSize: `${lyricsFontSize}pt` }}
                className={`justify-center self-center text-baseblack font-bold whitespace-pre`}
            >
                {searchParams.get("q")
                    ? songData.lyrics
                          .split(regex)

                          .map((part) =>
                              regex.test(part) ? (
                                  <span className="bg-primary rounded-md">
                                      {part}
                                  </span>
                              ) : (
                                  part
                              )
                          )
                    : songData.lyrics}
            </p>
        </MainBodyContainer>
    );
};

export default LyricsPage;

export const loader = ({ params }) => {
    return getSong(params.songId);
};

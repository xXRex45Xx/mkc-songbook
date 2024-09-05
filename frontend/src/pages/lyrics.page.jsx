import {
    useLoaderData,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Button, Card } from "flowbite-react";

import BackSvg from "../assets/back.svg?react";
import { buttonTheme } from "../config/button-theme.config";
import MusicElement from "../components/music-element.component";
import { getSong } from "../utils/api/songs-api.util";

const LyricsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const songData = useLoaderData();

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
            <p className="flex justify-center self-stretch text-baseblack text-xl font-bold whitespace-pre">
                {songData.lyrics}
            </p>
        </MainBodyContainer>
    );
};

export default LyricsPage;

export const loader = ({ params }) => {
    return getSong(params.songId);
};

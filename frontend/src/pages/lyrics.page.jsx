import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Button, Card } from "flowbite-react";

import BackSvg from "../assets/back.svg?react";
import { buttonTheme } from "../config/button-theme.config";
import MusicElement from "../components/music-element.component";

const LyricsPage = ({ onBack }) => {
    const navigate = useNavigate();
    const location = useLocation();

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
                <div className="ml-auto flex items-center gap-12">
                    <MusicElement type="chord" detail="D" />
                    <MusicElement type="tempo" detail="Slow" />
                    <MusicElement type="rythm" detail="4/4 meter" />
                </div>
            </Card>
            <p className="flex justify-center self-stretch text-baseblack text-xl font-bold whitespace-pre">
                {`Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now I'm found
Was blind but now I see
'Twas grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed
Through many dangers, toils and snares
I have already come
'Tis Grace that brought me safe thus far
And grace will lead me home
When we've been there ten thousand years
Bright shining as the sun
We've no less days to sing God's praise
Than when we've first begun`}
            </p>
        </MainBodyContainer>
    );
};

export default LyricsPage;

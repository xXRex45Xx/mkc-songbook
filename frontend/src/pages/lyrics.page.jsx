import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";

import { getSong } from "../utils/api/songs-api.util";
import { Suspense, useMemo } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import LyricViewer from "../components/lyric-viewer.component";

const LyricsPage = () => {
    const loaderData = useLoaderData();

    return (
        <MainBodyContainer>
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.song}>
                    {(song) => <LyricViewer song={song} />}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default LyricsPage;

export const loader = async ({ params }) => {
    return defer({ song: getSong(params.songId) });
};

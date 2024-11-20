import MainBodyContainer from "../components/main-body-container.component";

import { Await, defer, redirect, useLoaderData } from "react-router-dom";

import "./upload-song.styles.css";
import { getAllAlbums } from "../utils/api/album-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { addOrEditSong } from "../utils/api/songs-api.util";
import SongForm from "../components/song-form.component";

const UploadSongPage = () => {
    const loaderData = useLoaderData();

    return (
        <MainBodyContainer title="Upload Song">
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.albums}>
                    {(albums) => (
                        <SongForm
                            albums={albums}
                            method="POST"
                            action="/songs/new"
                        />
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default UploadSongPage;

export const loader = () => {
    return defer({ albums: getAllAlbums(true) });
};

export const action = async ({ request }) => {
    const formData = await request.formData();
    try {
        const data = await addOrEditSong(formData, false);
        if (!data || !data.insertedId)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/songs/${data.insertedId}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

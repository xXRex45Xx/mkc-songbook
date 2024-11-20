import {
    Await,
    defer,
    redirect,
    useLoaderData,
    useParams,
} from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getAllAlbums } from "../utils/api/album-api.util";
import { addOrEditSong, getSong } from "../utils/api/songs-api.util";
import SongForm from "../components/song-form.component";

const EditSongPage = () => {
    const loaderData = useLoaderData();
    const params = useParams();
    return (
        <MainBodyContainer title="Edit Song">
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.data}>
                    {([albums, song]) => (
                        <SongForm
                            song={song}
                            albums={albums}
                            method="PUT"
                            action={`/songs/${params.songId}/edit`}
                        />
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default EditSongPage;

export const loader = ({ params }) => {
    const { songId } = params;
    return defer({
        data: Promise.all([getAllAlbums(true), getSong(songId)]),
    });
};

export const action = async ({ request, params }) => {
    const formData = await request.formData();
    try {
        const data = await addOrEditSong(formData, true, params.songId);
        console.log(data);
        if (!data || !data.updated)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/songs/${formData.get("id")}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

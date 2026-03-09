/**
 * @fileoverview Edit song page component
 * Allows authenticated users to update song information
 */

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

/**
 * Edit Song Page Component
 *
 * Displays song form pre-populated with existing song data
 * Shows available albums for song categorization
 *
 * @component
 * @returns {JSX.Element} Song edit form
 */
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

/**
 * Route loader for edit song page
 * Fetches existing song data and all albums for categorization
 *
 * @param {Object} params - Route parameters
 * @param {string} params.songId - The song identifier to edit
 * @returns {Promise<{data: Array<Object>}>} Resolves to [albums, song] tuple
 * @throws {Error} 404: Song not found
 */
export const loader = ({ params }) => {
    const { songId } = params;
    return defer({
        data: Promise.all([getAllAlbums(true), getSong(songId)]),
    });
};

/**
 * Route action for edit song page
 * Handles song update submissions
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form submission data
 * @param {string} params.songId - The song identifier
 * @returns {Response|Object} Redirect on success, error object on validation failure
 * @throws {Error} 400: Invalid input, 500: Server error
 */
export const action = async ({ request, params }) => {
    const formData = await request.formData();
    try {
        const data = await addOrEditSong(formData, true, params.songId);
        if (!data || !data.updated)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/songs/${formData.get("id")}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

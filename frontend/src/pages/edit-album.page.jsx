/**
 * @fileoverview Edit album page component
 * Allows authenticated users to update album information
 */

import {
    useLoaderData,
    useParams,
    redirect,
    Await,
    defer,
} from "react-router-dom";
import AlbumForm from "../components/album-form.component";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getAlbum } from "../utils/api/album-api.util";
import MainBodyContainer from "../components/main-body-container.component";
import { addOrEditAlbum } from "../utils/api/album-api.util";

/**
 * Edit Album Page Component
 *
 * Displays album form pre-populated with existing album data
 * Only accessible to authorized users
 *
 * @component
 * @returns {JSX.Element} Album edit form
 */
const EditAlbumPage = () => {
    const loaderData = useLoaderData();
    const params = useParams();

    return (
        <MainBodyContainer title="Edit Album">
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.data}>
                    {(album) => (
                        <AlbumForm
                            album={album}
                            method="PUT"
                            action={`/albums/${params.albumId}/edit`}
                        />
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default EditAlbumPage;

/**
 * Route loader for edit album page
 * Fetches existing album data for form pre-population
 *
 * @param {Object} params - Route parameters
 * @param {string} params.albumId - The album identifier to edit
 * @returns {Promise<{data: Object}>} Resolves to album data
 * @throws {Error} 404: Album not found
 */
export const loader = ({ params }) => {
    const { albumId } = params;
    return defer({
        data: getAlbum(albumId),
    });
};

/**
 * Route action for edit album page
 * Handles album update submissions
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form submission data
 * @param {string} params.albumId - The album identifier
 * @returns {Response|Object} Redirect on success, error object on validation failure
 * @throws {Error} 400: Invalid input, 500: Server error
 */
export const action = async ({ request, params }) => {
    const formData = await request.formData();
    try {
        const data = await addOrEditAlbum(formData, true, params.albumId);
        if (!data || !data.updated)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/albums/${formData.get("id")}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

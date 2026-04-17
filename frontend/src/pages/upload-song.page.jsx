/**
 * @fileoverview Upload song page component
 * Allows admins to upload new songs with album selection
 */

import MainBodyContainer from "../components/main-body-container.component";

import { Await, defer, redirect, useLoaderData } from "react-router-dom";

import "./upload-song.styles.css";
import { getAllAlbums } from "../utils/api/album-api.util";
import { Suspense, useEffect } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { addOrEditSong } from "../utils/api/songs-api.util";
import SongForm from "../components/song-form.component";
import { useSelector } from "react-redux";

/**
 * Upload Song Page Component
 *
 * Displays form for uploading new songs
 * Includes album selection dropdown
 * Supports file upload for audio and metadata
 *
 * @component
 * @returns {JSX.Element} Song upload form
 */
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

/**
 * Route loader for upload song page
 * Fetches available albums for selection
 *
 * @returns {Promise<{albums: Object}>} Resolves to albums list
 * @throws {Error} 401: Unauthenticated
 */
export const loader = () => {
    return defer({ albums: getAllAlbums(true) });
};

/**
 * Route action for upload song page
 * Handles song upload submissions
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form submission data
 * @returns {Response|Object} Redirect on success, error object on validation failure
 * @throws {Error} 400: Invalid input, 500: Server error
 */
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

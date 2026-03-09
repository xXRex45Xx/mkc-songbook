/**
 * @fileoverview Edit playlist page component
 * Allows playlist creators to update their playlist information
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
import PlaylistForm from "../components/playlist-form.component";
import { addOrEditPlaylist, getPlaylist } from "../utils/api/playlist-api.util";
import { useSelector } from "react-redux";

/**
 * Edit Playlist Page Component
 *
 * Displays playlist form pre-populated with existing playlist data
 * Only accessible to playlist creators
 *
 * @component
 * @returns {JSX.Element} Playlist edit form
 */
const EditPlaylistPage = () => {
	const loaderData = useLoaderData();
	const params = useParams();
	const user = useSelector((state) => state.user.currentUser);

	return (
		<MainBodyContainer title="Edit Playlist">
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.data}>
					{(playlist) => {
						if (!user || user.id !== playlist.creator._id)
							throw {
								message: "You are not authorized to edit this playlist",
								status: 403,
							};
						return (
							<PlaylistForm
								playlist={playlist}
								method="PUT"
								action={`/playlists/${params.playlistId}/edit`}
							/>
						);
					}}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default EditPlaylistPage;

/**
 * Route loader for edit playlist page
 * Fetches existing playlist data and verifies ownership
 *
 * @param {Object} params - Route parameters
 * @param {string} params.playlistId - The playlist identifier to edit
 * @returns {Promise<{data: Object}>} Resolves to playlist data
 * @throws {Error} 403: Not authorized, 404: Playlist not found
 */
export const loader = ({ params }) => {
	const { playlistId } = params;
	return defer({
		data: getPlaylist(playlistId),
	});
};

/**
 * Route action for edit playlist page
 * Handles playlist update submissions
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form submission data
 * @param {string} params.playlistId - The playlist identifier
 * @returns {Response|Object} Redirect on success, error object on validation failure
 * @throws {Error} 400: Invalid input, 500: Server error
 */
export const action = async ({ request, params }) => {
	const formData = await request.formData();
	try {
		const data = await addOrEditPlaylist(formData, true, params.playlistId);
		if (!data || !data.updated)
			throw { status: 500, message: "An unexpected error occurred." };
		return redirect(`/playlists/${params.playlistId}`);
	} catch (error) {
		if (error.status === 400) return { ...error, status: null };
		throw error;
	}
};

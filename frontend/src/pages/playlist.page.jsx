/**
 * @fileoverview Playlist detail page component
 * Displays a specific playlist with its songs
 */

import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getPlaylist } from "../utils/api/playlist-api.util";
import PlaylistViewer from "../components/playlist-viewer.component";
import { getFavorites } from "../utils/api/user-api.util";
import { getLocalPlaylist } from "../utils/api/local-playlist-api.util";

/**
 * Playlist Page Component
 *
 * Displays detailed view of a specific playlist or favorites
 * Uses Suspense and Await for lazy-loaded playlist data
 *
 * @component
 * @returns {JSX.Element} Playlist detail view
 */
const PlaylistPage = () => {
	const loaderData = useLoaderData();

	return (
		<MainBodyContainer>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.playlist}>
					{(playlist) => <PlaylistViewer playlist={playlist} />}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default PlaylistPage;

/**
 * Route loader for playlist detail page
 * Fetches playlist data by playlist ID or favorites
 *
 * @param {Object} params - Route parameters
 * @param {string} params.playlistId - The playlist identifier or "favorites"
 * @returns {Promise<{playlist: Object}>} Resolves to playlist data
 * @throws {Error} 404: Playlist not found
 */
export const loader = async ({ params }) => {
	if (params.playlistId === "favorites")
		return defer({ playlist: getFavorites() });

	const isLocalPlaylist = params.playlistId.startsWith("local_");
	if (isLocalPlaylist) {
		const localPlaylist = await getLocalPlaylist(params.playlistId);
		if (!localPlaylist) {
			throw new Error("Playlist not found");
		}
		return defer({ playlist: localPlaylist });
	}

	return defer({ playlist: getPlaylist(params.playlistId) });
};

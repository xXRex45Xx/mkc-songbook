/**
 * @fileoverview Album detail page component
 * Displays detailed view of a single album with its songs
 */

import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { getAlbum } from "../utils/api/album-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import AlbumViewer from "../components/album-viewer.component";

/**
 * Album Page Component
 *
 * Displays detailed information about a specific album
 * Uses Suspense and Await for lazy-loaded album data
 *
 * @component
 * @returns {JSX.Element} Album detail view
 */
const AlbumPage = () => {
	const loaderData = useLoaderData();

	return (
		<MainBodyContainer>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.album}>
					{(album) => <AlbumViewer album={album} />}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default AlbumPage;

/**
 * Route loader for album detail page
 * Fetches album data by album ID
 *
 * @param {Object} params - Route parameters
 * @param {string} params.albumId - The album identifier
 * @returns {Promise<{album: Object}>} Resolves to album data
 * @throws {Error} 404: Album not found
 */
export const loader = ({ params }) => {
	return defer({ album: getAlbum(params.albumId) });
};

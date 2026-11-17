/**
 * @fileoverview Album detail page component
 * Displays detailed view of a single album with its songs
 * Uses IndexedDB-first loading with background network sync
 */

import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { getAlbum } from "../utils/api/album-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import AlbumViewer from "../components/album-viewer.component";
import { albumIdbService } from "../utils/db/album-idb-service.util";

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
 * Uses IndexedDB-first approach: tries local data first, then fetches fresh data
 *
 * @param {Object} params - Route parameters
 * @param {string} params.albumId - The album identifier
 * @returns {Promise<{album: Object}>} Resolves to album data
 */
export const loader = async ({ params }) => {
	const refreshAlbum = () =>
		getAlbum(params.albumId)
			.then((freshAlbum) => albumIdbService.bulkPut([freshAlbum]))
			.catch(() => {});

	try {
		const localAlbum = await albumIdbService.getById(params.albumId);
		// The album store is seeded from the list endpoint, which strips the
		// `songs` array. Only serve from cache when it is complete enough to
		// render the detail page without throwing.
		if (localAlbum && Array.isArray(localAlbum.songs)) {
			refreshAlbum();
			return defer({ album: localAlbum });
		}
	} catch (e) {
		console.error("Failed to load album from IndexedDB:", e);
	}

	const freshAlbum = getAlbum(params.albumId);
	refreshAlbum();
	return defer({ album: freshAlbum });
};

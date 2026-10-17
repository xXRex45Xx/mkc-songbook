/**
 * @fileoverview Albums listing page component
 * Displays all albums with search functionality
 * Uses IndexedDB-first loading with background network sync
 */

import MainBodyContainer from "../components/main-body-container.component";
import AlbumCard from "../components/album-card.component";
import { Await, defer, useLoaderData } from "react-router-dom";
import { getAllAlbums } from "../utils/api/album-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import backendURL from "../config/backend-url.config";
import AdminHelper from "../components/admin-helper.component";
import { albumIdbService } from "../utils/db/album-idb-service.util";
import { syncAlbums } from "../utils/pwa/sync-service.util";

/**
 * Albums Page Component
 *
 * Displays a grid of album cards with search functionality
 * Shows admin helper for authenticated users
 *
 * @component
 * @returns {JSX.Element} Albums listing page
 */
const AlbumsPage = () => {
	const loaderData = useLoaderData();

	return (
		<MainBodyContainer
			title={"Albums"}
			titleHelper={
				<div className="flex items-center gap-7">
					<AdminHelper />
				</div>
			}
		>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.albumData}>
					{(albums) => (
						<div className="flex flex-wrap gap-6">
							{albums.map((album) => (
								<AlbumCard
									key={album._id}
									number={album._id}
									title={album.name}
									imgSrc={backendURL + album.photoLink}
									numOfSongs={album.numOfSongs}
									year={album.createdAt}
								/>
							))}
						</div>
					)}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};
export default AlbumsPage;

/**
 * Route loader for albums listing page
 * Uses IndexedDB-first approach: returns local data immediately, syncs in background
 * Falls back to network-only for search queries
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{albumData: Array<Object>}>} Resolves to album list
 */
export const loader = async ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const searchQuery = { q: searchParams.get("q") };

	if (searchQuery.q) {
		return defer({ albumData: getAllAlbums(false, searchQuery) });
	}

	try {
		const localAlbums = await albumIdbService.getAll();
		if (localAlbums && localAlbums.length > 0) {
			syncAlbums().catch(() => {});
			return defer({ albumData: localAlbums });
		}
	} catch (e) {
		console.error("Failed to load albums from IndexedDB:", e);
	}

	return defer({ albumData: getAllAlbums(false, searchQuery) });
};

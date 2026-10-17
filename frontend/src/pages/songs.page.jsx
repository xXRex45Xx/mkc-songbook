/**
 * @fileoverview Songs listing page component
 * Displays all songs with sorting and search functionality
 * Uses IndexedDB-first loading with background network sync
 */

import MainBodyContainer from "../components/main-body-container.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";
import { Await, defer, useLoaderData } from "react-router-dom";
import { Suspense } from "react";
import SongsTable from "../components/songs-table.component";
import CustomTailSpin from "../components/custom-tail-spin.component";
import AdminHelper from "../components/admin-helper.component";
import { songIdbService } from "../utils/db/song-idb-service.util";
import { syncSongs } from "../utils/pwa/sync-service.util";

/**
 * Songs Page Component
 *
 * Displays a table of songs with sorting and filtering options
 * Shows admin helper for authenticated users with appropriate roles
 *
 * @component
 * @returns {JSX.Element} Songs listing page
 */
const SongsPage = () => {
	const loaderData = useLoaderData();
	return (
		<MainBodyContainer
			title={"Songs"}
			titleHelper={
				<div className="flex items-center gap-7">
					<AdminHelper />
					<SortDropdown />
				</div>
			}
		>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.songData}>
					{({ songs, totalPages }) => (
						<SongsTable
							songs={songs}
							totalPages={totalPages}
							showPlayButton
							singleSongQueue
						/>
					)}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default SongsPage;

/**
 * Route loader for songs listing page
 * Uses IndexedDB-first approach: returns local data immediately, syncs in background
 * Falls back to network-only for search/sort queries that IndexedDB can't handle
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{songData: Object}>} Resolves to songs and pagination data
 */
export const loader = async ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const page = searchParams.get("page");
	const searchQuery = {
		q: searchParams.get("q"),
		type: searchParams.get("type"),
		sortBy: searchParams.get("sortby"),
	};

	const hasSearchParams = searchQuery.q || searchQuery.sortBy;

	if (hasSearchParams) {
		return defer({
			songData: getAllOrSearchSongs(searchQuery, page ? page : 1),
		});
	}

	try {
		const localSongs = await songIdbService.getAll();
		if (localSongs && localSongs.length > 0) {
			syncSongs().catch(() => {});
			return defer({
				songData: {
					songs: localSongs.map((song) => ({
						...song,
						songFilePath: undefined,
					})),
					totalPages: 1,
				},
			});
		}
	} catch (e) {
		console.error("Failed to load songs from IndexedDB:", e);
	}

	return defer({
		songData: getAllOrSearchSongs(searchQuery, page ? page : 1),
	});
};

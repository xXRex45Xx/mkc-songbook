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
import { searchLocalSongs } from "../utils/offline-search.util";

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
							showNoResults
						/>
					)}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default SongsPage;

/**
 * Searches and sorts the locally cached songs
 * Mirrors the response shape of the songs API so the page component is unaware
 * of where the data came from.
 *
 * @param {Object} searchQuery - Search parameters
 * @param {number} [page=1] - Page number for pagination
 * @returns {Promise<{songs: Array<Object>, totalPages: number}>} Matching songs
 */
const searchLocalSongsForPage = async (searchQuery, page = 1) => {
	const localSongs = await songIdbService.getAll();

	const sorted = searchLocalSongs(localSongs, searchQuery);
	const perPage = 100;
	const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
	const start = (page - 1) * perPage;
	const slice = sorted.slice(start, start + perPage);

	return {
		songs: slice.map((song) => ({
			...song,
			songFilePath: undefined,
		})),
		totalPages,
	};
};

/**
 * Route loader for songs listing page
 * Uses IndexedDB-first approach: returns local data immediately, syncs in background.
 * Search and sort query the local cache when offline, and fall back to it when an
 * online search fails.
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{songData: Object}>} Resolves to songs and pagination data
 */
export const loader = async ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const rawPage = searchParams.get("page");
	const page = Math.max(1, Number(rawPage) || 1);
	const searchQuery = {
		q: searchParams.get("q"),
		type: searchParams.get("type"),
		sortBy: searchParams.get("sortby"),
	};

	const hasSearchParams = searchQuery.q || searchQuery.sortBy;

	if (hasSearchParams) {
		if (navigator.onLine) {
			return defer({
				songData: getAllOrSearchSongs(searchQuery, page).catch(() =>
					searchLocalSongsForPage(searchQuery, page)
				),
			});
		}

		return defer({ songData: searchLocalSongsForPage(searchQuery, page) });
	}

	try {
		const localSongs = await songIdbService.getAll();
		if (localSongs && localSongs.length > 0) {
			if (navigator.onLine) syncSongs().catch(() => {});
			const sorted = searchLocalSongs(localSongs, {});
			const totalPages = Math.max(
				1,
				Math.ceil(sorted.length / 100)
			);
			const start = (page - 1) * 100;
			return defer({
				songData: {
					songs: sorted
						.slice(start, start + 100)
						.map((song) => ({
							...song,
							songFilePath: undefined,
						})),
					totalPages,
				},
			});
		}
	} catch (e) {
		console.error("Failed to load songs from IndexedDB:", e);
	}

	return defer({
		songData: getAllOrSearchSongs(searchQuery, page).catch(() =>
			searchLocalSongsForPage(searchQuery, page)
		),
	});
};

/**
 * @fileoverview Songs listing page component
 * Displays all songs with sorting and search functionality
 */

import MainBodyContainer from "../components/main-body-container.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";
import { Await, defer, useLoaderData } from "react-router-dom";
import { Suspense } from "react";
import SongsTable from "../components/songs-table.component";
import CustomTailSpin from "../components/custom-tail-spin.component";
import AdminHelper from "../components/admin-helper.component";

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
 * Fetches songs with optional search query, type filter, and sorting
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{songData: Object}>} Resolves to songs and pagination data
 * @throws {Error} 401: Unauthenticated
 */
export const loader = ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const page = searchParams.get("page");
	const searchQuery = {
		q: searchParams.get("q"),
		type: searchParams.get("type"),
		sortBy: searchParams.get("sortby"),
	};
	return defer({
		songData: getAllOrSearchSongs(searchQuery, page ? page : 1),
	});
};

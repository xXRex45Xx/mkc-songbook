/**
 * @fileoverview Lyrics page component
 * Displays song lyrics with viewer component
 */

import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";

import { getSong } from "../utils/api/songs-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import LyricViewer from "../components/lyric-viewer.component";

/**
 * Lyrics Page Component
 *
 * Displays song lyrics using the LyricViewer component
 * Uses Suspense and Await for lazy-loaded song data
 *
 * @component
 * @returns {JSX.Element} Lyrics viewer page
 */
const LyricsPage = () => {
	const loaderData = useLoaderData();

	return (
		<MainBodyContainer>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.song}>
					{(song) => <LyricViewer song={song} />}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default LyricsPage;

/**
 * Route loader for lyrics page
 * Fetches song data by song ID
 *
 * @param {Object} params - Route parameters
 * @param {string} params.songId - The song identifier
 * @returns {Promise<{song: Object}>} Resolves to song data
 * @throws {Error} 404: Song not found
 */
export const loader = async ({ params }) => {
	return defer({ song: getSong(params.songId) });
};

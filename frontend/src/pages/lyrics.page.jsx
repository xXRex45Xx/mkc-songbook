/**
 * @fileoverview Lyrics page component
 * Displays song lyrics with viewer component
 * Uses IndexedDB-first loading with background network sync
 */

import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";

import { getSong } from "../utils/api/songs-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import LyricViewer from "../components/lyric-viewer.component";
import { songIdbService } from "../utils/db/song-idb-service.util";

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
 * Uses IndexedDB-first approach: tries local data first, then fetches fresh data
 *
 * @param {Object} params - Route parameters
 * @param {string} params.songId - The song identifier
 * @returns {Promise<{song: Object}>} Resolves to song data
 */
export const loader = async ({ params }) => {
	try {
		const localSong = await songIdbService.getById(params.songId);
		if (localSong) {
			getSong(params.songId)
				.then((freshSong) => songIdbService.bulkPut([freshSong]))
				.catch(() => {});
			return defer({
				song: { ...localSong, songFilePath: undefined },
			});
		}
	} catch (e) {
		console.error("Failed to load song from IndexedDB:", e);
	}

	return defer({ song: getSong(params.songId) });
};

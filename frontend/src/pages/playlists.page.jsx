/**
 * @fileoverview Playlists listing page component
 * Displays all user playlists with creation functionality
 */

import MainBodyContainer from "../components/main-body-container.component";
import PlaylistCard from "../components/playlist-card.component";
import playlistIcon from "../assets/playlist.png";
import addSmallIcon from "../assets/add-small-white.svg";
import { Button } from "flowbite-react";
import { uploadButtonTheme } from "../config/button-theme.config";
import { Await, defer, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useMemo } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getAllPlaylists } from "../utils/api/playlist-api.util";
import { useSelector } from "react-redux";

/**
 * Playlists Page Component
 *
 * Displays a grid of playlist cards with search functionality
 * Shows create playlist button for all users (saves locally if not authenticated)
 * Includes favorites shortcut for logged-in users
 * Shows local playlists mixed with server playlists
 *
 * @component
 * @returns {JSX.Element} Playlists listing page
 */
const PlaylistsPage = () => {
	const navigate = useNavigate();
	const loaderData = useLoaderData();
	const user = useSelector((state) => state.user.currentUser);
	const localPlaylists = useSelector((state) => state.localPlaylists.localPlaylists);
	const unsyncedPlaylists = useMemo(
		() => localPlaylists.filter((p) => !p.synced),
		[localPlaylists]
	);

	return (
		<MainBodyContainer
			title={"Playlists"}
			titleHelper={
				<div className="flex items-center gap-7">
					<Button
						color="failure"
						className="text-nowrap focus:ring-0 h-full"
						theme={uploadButtonTheme}
						size="xs"
						onClick={() => navigate("/playlists/new")}
					>
						Create Playlist
						<img src={addSmallIcon} alt="" />
					</Button>
				</div>
			}
		>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.playlistData}>
					{({ playlists }) => {
						const mergedPlaylists =[...unsyncedPlaylists, ...playlists];
						return (
							<div className="flex flex-wrap gap-6">
								{user && <PlaylistCard favorite id="favorites" />}
								{mergedPlaylists.map((playlist) => (
									<PlaylistCard
										key={playlist._id || playlist.id}
										id={playlist._id || playlist.id}
										title={playlist.name}
										numOfSongs={playlist.numOfSongs || playlist.songs?.length}
										imgSrc={playlistIcon}
										isLocal={!playlist._id || (playlist.id && playlist.id.startsWith("local_"))}
										synced={playlist.synced}
									/>
								))}
							</div>
						);
					}}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default PlaylistsPage;

/**
 * Route loader for playlists listing page
 * Fetches all playlists with optional search query and pagination
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{playlistData: Object}>} Resolves to playlists and pagination data
 * @throws {Error} 401: Unauthenticated
 */
export const loader = ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const searchQuery = { q: searchParams.get("q") };
	const page = searchParams.get("page");
	return defer({
		playlistData: getAllPlaylists(searchQuery, page ? page : 1),
	});
};

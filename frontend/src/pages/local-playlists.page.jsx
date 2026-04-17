/**
 * @fileoverview Local playlists page component
 * Displays playlists stored locally in the browser
 */

import MainBodyContainer from "../components/main-body-container.component";
import PlaylistCard from "../components/playlist-card.component";
import playlistIcon from "../assets/playlist.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Local Playlists Page Component
 *
 * Displays a grid of locally stored playlists
 * Allows users to manage and upload their local playlists
 *
 * @component
 * @returns {JSX.Element} Local playlists listing page
 * @example
 * ```jsx
 * // Route: /local-playlists
 * <LocalPlaylistsPage />
 * ```
 */
const LocalPlaylistsPage = () => {
	const navigate = useNavigate();
	const localPlaylists = useSelector(
		(state) => state.localPlaylists.localPlaylists
	);
	const user = useSelector((state) => state.user.currentUser);

	return (
		<MainBodyContainer
			title={"Local Playlists"}
			titleHelper={
				!user && (
					<span className="text-sm text-neutrals-500">
						Sign in to sync your playlists to the server
					</span>
				)
			}
		>
			{localPlaylists.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 gap-4">
					<img
						src={playlistIcon}
						alt="Playlist"
						className="w-24 h-auto opacity-50"
					/>
					<p className="text-neutrals-500 text-center">
						No local playlists yet.
					</p>
					<p className="text-neutrals-400 text-sm text-center max-w-md">
						{user
							? "Create a new playlist to get started!"
							: "Sign in to create playlists that sync to the cloud, or create a local playlist to save songs for later."}
					</p>
					<button
						onClick={() => navigate("/playlists/new")}
						className="mt-2 text-primary hover:text-primary-600"
					>
						Create Playlist
					</button>
				</div>
			) : (
				<div className="flex flex-wrap gap-6">
					{localPlaylists.map((playlist) => (
						<PlaylistCard
							key={playlist.id}
							id={playlist.id}
							title={playlist.name}
							numOfSongs={playlist.songs?.length || 0}
							imgSrc={playlistIcon}
							isLocal={true}
							synced={playlist.synced}
						/>
					))}
				</div>
			)}
		</MainBodyContainer>
	);
};

export default LocalPlaylistsPage;

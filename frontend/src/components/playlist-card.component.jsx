/**
 * @fileoverview Playlist card component for displaying playlist information
 * Features favorites and album cards with navigation
 */

import { Card } from "flowbite-react";
import {
	albumCardTheme,
	favoritesCardTheme,
} from "../config/card-theme.config";
import { useNavigate } from "react-router-dom";
import largeHeartIcon from "../assets/heart-large.svg";
import { useSelector } from "react-redux";

/**
 * Playlist Card Component
 *
 * A card component for displaying playlist information with navigation.
 * Features:
 * - Playlist cover image or favorite icon
 * - Playlist name and song count
 * - Click navigation to playlist details
 * - Special styling for favorites playlist
 * - Local badge for locally stored playlists
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Playlist identifier
 * @param {string} props.title - Playlist title
 * @param {number} props.numOfSongs - Number of songs in playlist
 * @param {string} props.imgSrc - Playlist cover image URL
 * @param {Function} [props.onClick] - Custom click handler
 * @param {boolean} [props.favorite=false] - Whether this is a favorites playlist
 * @param {boolean} [props.isLocal=false] - Whether this is a local playlist
 * @param {boolean} [props.synced=false] - Whether local playlist has been synced
 * @returns {JSX.Element} Playlist card component
 * @example
 * ```jsx
 * <PlaylistCard
 *   id="local_123"
 *   title="My Favorites"
 *   numOfSongs={10}
 *   imgSrc={playlistIcon}
 *   isLocal={true}
 *   synced={false}
 * />
 * ```
 */
const PlaylistCard = ({
	id,
	title,
	numOfSongs,
	imgSrc,
	onClick,
	favorite,
	isLocal = false,
	synced = false,
}) => {
	const navigate = useNavigate();
	const user = useSelector((state) => state.user.currentUser);
	return (
		<Card theme={favorite ? favoritesCardTheme : albumCardTheme}>
			<div
				className="flex-1 flex flex-col justify-center gap-4 cursor-pointer relative"
				onClick={onClick ? onClick : () => navigate(`/playlists/${id}`)}
			>
				{isLocal && (
					<span className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded">
						{synced ? "Synced" : "Local"}
					</span>
				)}
				<img
					src={favorite ? largeHeartIcon : imgSrc}
					alt="Playlist cover"
					className="w-40 h-auto self-center"
				/>
				<h3 className="text-baseblack text-[16px] font-inter font-semibold leading-[120%]">
					{favorite ? "Favorite Tracks" : title}
				</h3>
				<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
					{favorite ? user?.favorites.length : numOfSongs} songs
				</p>
			</div>
		</Card>
	);
};

export default PlaylistCard;

/**
 * @fileoverview Horizontal playlist card component for displaying playlist information
 * Provides playlist metadata in a horizontal layout with cover image
 */

import { Card } from "flowbite-react";
import {
	favoritesHorizontalCardTheme,
	horizontalCardTheme,
} from "../config/card-theme.config";

/**
 * Horizontal Playlist Card Component
 *
 * A horizontal layout card for displaying playlist information.
 * Features:
 * - Playlist cover image or favorite icon
 * - Playlist name and creator
 * - Visibility status and song count
 * - Special styling for favorite playlists
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Playlist name
 * @param {string} props.visibility - Playlist visibility status
 * @param {string} props.creator - Playlist creator name
 * @param {number} props.numOfSongs - Number of songs in playlist
 * @param {string} props.imgSrc - Playlist cover image URL
 * @param {boolean} [props.favorites=false] - Whether this is a favorites playlist
 */
const HorizontalPlaylistCard = ({
	name,
	visibility,
	creator,
	numOfSongs,
	imgSrc,
	favorites,
}) => (
	<Card
		className="text-baseblack"
		theme={favorites ? favoritesHorizontalCardTheme : horizontalCardTheme}
	>
		<div className="flex-1 flex gap-5">
			<img src={imgSrc} className="w-52 rounded-md" />
			<div className="flex-1 flex flex-col py-5 px-4 justify-between">
				<div className="flex flex-col gap-1.5">
					<h1 className="text-3xl font-bold">{name}</h1>
					<h2 className="text-neutrals-800 text-2xl">{creator}</h2>
					<p className="text-neutrals-600 text-base">
						{visibility} . {numOfSongs} songs
					</p>
				</div>
			</div>
		</div>
	</Card>
);

export default HorizontalPlaylistCard;

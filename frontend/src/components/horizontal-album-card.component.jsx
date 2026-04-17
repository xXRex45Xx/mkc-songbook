/**
 * @fileoverview Horizontal album card component for displaying album information
 * Provides album metadata in a horizontal layout with cover image
 */

import { horizontalCardTheme } from "../config/card-theme.config";
import { Card } from "flowbite-react";

/**
 * Horizontal Album Card Component
 *
 * A horizontal layout card for displaying album information.
 * Features:
 * - Large album cover image
 * - Album title and artist name
 * - Release year and song count
 * - Consistent card styling with theme
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Album title
 * @param {string} props.year - Release year
 * @param {number} props.numOfSongs - Number of songs in album
 * @param {string} props.imgSrc - Album cover image URL
 */
const HorizontalAlbumCard = ({ title, year, numOfSongs, imgSrc }) => (
	<Card className="text-baseblack" theme={horizontalCardTheme}>
		<div className="flex-1 flex gap-5">
			<img src={imgSrc} className="w-52 rounded-md" />
			<div className="flex-1 flex flex-col py-5 px-4 justify-between">
				<div className="flex flex-col gap-1.5">
					<h1 className="text-3xl font-bold">{title}</h1>
					<h2 className="text-neutrals-800 text-2xl">MKC Choir</h2>
					<p className="text-neutrals-600 text-base">
						{year} . {numOfSongs} songs
					</p>
				</div>
			</div>
		</div>
	</Card>
);

export default HorizontalAlbumCard;

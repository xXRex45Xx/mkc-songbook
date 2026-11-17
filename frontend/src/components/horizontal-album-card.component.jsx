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
		<div className="flex-1 flex flex-col gap-4 md:flex-row md:gap-5">
			<img src={imgSrc} className="w-full h-40 object-cover rounded-md md:h-auto md:w-52 md:object-fill" />
			<div className="flex-1 flex flex-col px-0 py-0 justify-between md:py-5 md:px-4">
				<div className="flex flex-col gap-1.5">
					<h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
					<h2 className="text-neutrals-800 text-lg md:text-2xl">MKC Choir</h2>
					<p className="text-neutrals-600 text-sm md:text-base">
						{year} . {numOfSongs} songs
					</p>
				</div>
			</div>
		</div>
	</Card>
);

export default HorizontalAlbumCard;

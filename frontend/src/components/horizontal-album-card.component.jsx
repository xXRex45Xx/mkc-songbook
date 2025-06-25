import { horizontalCardTheme } from "../config/card-theme.config";
import { Card } from "flowbite-react";
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

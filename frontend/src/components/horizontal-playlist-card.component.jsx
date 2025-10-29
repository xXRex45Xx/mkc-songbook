import { Card } from "flowbite-react";
import { horizontalCardTheme } from "../config/card-theme.config";

const HorizontalPlaylistCard = ({
	name,
	visibility,
	creator,
	numOfSongs,
	imgSrc,
}) => (
	<Card className="text-baseblack" theme={horizontalCardTheme}>
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

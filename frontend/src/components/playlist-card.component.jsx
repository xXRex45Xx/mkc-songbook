import { Card } from "flowbite-react";
import { albumCardTheme } from "../config/card-theme.config";
import { useNavigate } from "react-router-dom";

const PlaylistCard = ({ id, title, numOfSongs, imgSrc }) => {
	const navigate = useNavigate();
	return (
		<Card theme={albumCardTheme}>
			<div
				className="flex-1 flex flex-col justify-center gap-4 cursor-pointer"
				onClick={() => navigate(`/playlists/${id}`)}
			>
				<img
					src={imgSrc}
					alt="Playlist cover"
					className="w-40 h-auto self-center"
				/>
				<h3 className="text-baseblack text-[16px] font-inter font-semibold leading-[120%]">
					{title}
				</h3>
				<p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
					{numOfSongs} songs
				</p>
			</div>
		</Card>
	);
};

export default PlaylistCard;

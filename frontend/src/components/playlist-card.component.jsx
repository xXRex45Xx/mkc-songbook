import { Card } from "flowbite-react";
import {
	albumCardTheme,
	favoritesCardTheme,
} from "../config/card-theme.config";
import { useNavigate } from "react-router-dom";
import largeHeartIcon from "../assets/heart-large.svg";
import { useSelector } from "react-redux";

const PlaylistCard = ({ id, title, numOfSongs, imgSrc, onClick, favorite }) => {
	const navigate = useNavigate();
	const user = useSelector((state) => state.user.currentUser);
	return (
		<Card theme={favorite ? favoritesCardTheme : albumCardTheme}>
			<div
				className="flex-1 flex flex-col justify-center gap-4 cursor-pointer"
				onClick={onClick ? onClick : () => navigate(`/playlists/${id}`)}
			>
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

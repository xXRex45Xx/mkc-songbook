import { useNavigate } from "react-router-dom";
import BackSvg from "../assets/back.svg?react";
import ShareSvg from "../assets/share.svg?react";
import OptionsSvg from "../assets/v-options.svg?react";
import { Button } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import HorizontalAlbumCard from "./horizontal-album-card.component";
import backendURL from "../config/backend-url.config";
import SongsTable from "./songs-table.component";

const AlbumViewer = ({ album }) => {
	const navigate = useNavigate();
	console.log(album);
	return (
		<div className="flex flex-col gap-5 w-full">
			<div className="flex gap-3.5">
				<Button
					className="w-8 border-none focus:ring-0 mr-auto"
					theme={buttonTheme}
					size="xxs"
					onClick={() => navigate(-1)}
				>
					<BackSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				</Button>
				<Button
					className="w-8 border-none focus:ring-0"
					theme={buttonTheme}
					size="xxs"
				>
					<ShareSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				</Button>
				<Button
					className="w-8 border-none focus:ring-0"
					theme={buttonTheme}
					size="xxs"
				>
					<OptionsSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				</Button>
			</div>
			<HorizontalAlbumCard
				title={album.name}
				year={album.createdAt}
				numOfSongs={album.songs.length}
				imgSrc={backendURL + album.photoLink}
			/>
			<SongsTable songs={album.songs} showOverflow />
		</div>
	);
};

export default AlbumViewer;

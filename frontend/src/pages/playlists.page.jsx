import MainBodyContainer from "../components/main-body-container.component";
import PlaylistCard from "../components/playlist-card.component";
import playlistIcon from "../assets/playlist.png";
import addSmallIcon from "../assets/add-small-white.svg";
import { Button } from "flowbite-react";
import { uploadButtonTheme } from "../config/button-theme.config";
import { Await, defer, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getAllPlaylists } from "../utils/api/playlist-api.util";

const PlaylistsPage = () => {
	const navigate = useNavigate();
	const loaderData = useLoaderData();
	return (
		<MainBodyContainer
			title={"Playlists"}
			titleHelper={
				<div className="flex items-center gap-7">
					<Button
						color="failure"
						className="text-nowrap focus:ring-0 h-full"
						theme={uploadButtonTheme}
						size="xs"
						onClick={() => navigate("/playlists/new")}
					>
						Create Playlist
						<img src={addSmallIcon} alt="" />
					</Button>
				</div>
			}
		>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.playlistData}>
					{({ playlists, totalPages }) => {
						return (
							<div className="flex gap-6">
								{playlists.map((playlist) => (
									<PlaylistCard
										key={playlist._id}
										id={playlist._id}
										title={playlist.name}
										numOfSongs={playlist.numOfSongs}
										imgSrc={playlistIcon}
									/>
								))}
							</div>
						);
					}}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default PlaylistsPage;

export const loader = ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const searchQuery = { q: searchParams.get("q") };
	const page = searchParams.get("page");
	return defer({
		playlistData: getAllPlaylists(searchQuery, page ? page : 1),
	});
};

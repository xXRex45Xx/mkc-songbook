import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getPlaylist } from "../utils/api/playlist-api.util";
import PlaylistViewer from "../components/playlist-viewer.component";

const PlaylistPage = () => {
	const loaderData = useLoaderData();

	return (
		<MainBodyContainer>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.playlist}>
					{(playlist) => <PlaylistViewer playlist={playlist} />}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default PlaylistPage;

export const loader = ({ params }) => {
	return defer({ playlist: getPlaylist(params.playlistId) });
};

import { Await, defer, useLoaderData } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { getAlbum } from "../utils/api/album-api.util";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import AlbumViewer from "../components/album-viewer.component";

const AlbumPage = () => {
	const loaderData = useLoaderData();

	return (
		<MainBodyContainer>
			<Suspense fallback={<CustomTailSpin />}>
				<Await resolve={loaderData.album}>
					{(album) => <AlbumViewer album={album} />}
				</Await>
			</Suspense>
		</MainBodyContainer>
	);
};

export default AlbumPage;

export const loader = ({ params }) => {
	return defer({ album: getAlbum(params.albumId) });
};

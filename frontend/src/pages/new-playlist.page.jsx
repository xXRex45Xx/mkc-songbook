import { redirect, useSearchParams } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import PlaylistForm from "../components/playlist-form.component";
import { addOrEditPlaylist } from "../utils/api/playlist-api.util";

const NewPlaylistPage = () => {
	const [searchParams, _setSearchParams] = useSearchParams();

	return (
		<MainBodyContainer title="Create Playlist">
			<PlaylistForm
				method="POST"
				action="/playlists/new"
				playlist={
					searchParams.get("songId")
						? {
								songs: [
									{
										_id: searchParams.get("songId"),
										title: searchParams.get("songTitle"),
									},
								],
						  }
						: undefined
				}
			/>
		</MainBodyContainer>
	);
};

export default NewPlaylistPage;

export const action = async ({ request }) => {
	const formData = await request.formData();

	try {
		const data = await addOrEditPlaylist(formData, false);
		if (!data || !data.insertedId)
			throw { status: 500, message: "An unexpected error occurred." };
		return redirect(`/playlists/${data.insertedId}`);
	} catch (error) {
		if (error.status === 400) return { ...error, status: null };
		throw error;
	}
};

import { redirect } from "react-router-dom";
import AlbumForm from "../components/album-form.component";
import MainBodyContainer from "../components/main-body-container.component";

const UploadAlbumPage = () => {
    return (
        <MainBodyContainer title="Upload Album">
            <AlbumForm method="POST" action="/albums/new" />
        </MainBodyContainer>
    );
};

export default UploadAlbumPage;

export const action = async ({ request }) => {
    const formData = await request.formData();
    const albumTitle = formData.get("title");
    const albumPlaylistLink = formData.get("youtube_playlist_link");
    const songList = formData.getAll("songs");

    console.log(albumTitle);
    console.log(albumPlaylistLink);
    console.log(songList);
    try {
        return redirect("/");
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

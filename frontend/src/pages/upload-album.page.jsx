import { redirect } from "react-router-dom";
import AlbumForm from "../components/album-form.component";
import MainBodyContainer from "../components/main-body-container.component";
import { addOrEditAlbum } from "../utils/api/album-api.util";
import "./upload-album.styles.css";
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

    try {
        const data = await addOrEditAlbum(formData, false);
        if (!data || !data.insertedId)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/albums/${data.insertedId}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

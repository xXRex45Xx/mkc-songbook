import {
    useLoaderData,
    useParams,
    redirect,
    Await,
    defer,
} from "react-router-dom";
import AlbumForm from "../components/album-form.component";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component";
import { getAlbum } from "../utils/api/album-api.util";
import MainBodyContainer from "../components/main-body-container.component";
import { addOrEditAlbum } from "../utils/api/album-api.util";

const EditAlbumPage = () => {
    const loaderData = useLoaderData();
    const params = useParams();

    return (
        <MainBodyContainer title="Edit Album">
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.data}>
                    {(album) => (
                        <AlbumForm
                            album={album}
                            method="PUT"
                            action={`/albums/${params.albumId}/edit`}
                        />
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default EditAlbumPage;

export const loader = ({ params }) => {
    const { albumId } = params;
    return defer({
        data: getAlbum(albumId),
    });
};

export const action = async ({ request, params }) => {
    const formData = await request.formData();
    try {
        const data = await addOrEditAlbum(formData, true, params.albumId);
        if (!data || !data.updated)
            throw { status: 500, message: "An unexpected error occurred." };
        return redirect(`/albums/${formData.get("id")}`);
    } catch (error) {
        if (error.status === 400) return { ...error, status: null };
        throw error;
    }
};

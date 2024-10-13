import MainBodyContainer from "../components/main-body-container.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";
import { Await, defer, useLoaderData } from "react-router-dom";
import { Suspense } from "react";
import { TailSpin } from "react-loader-spinner";
import SongsTable from "../components/songs-table.component";

const SongsPage = () => {
    const loaderData = useLoaderData();
    return (
        <MainBodyContainer title={"Songs"} titleHelper={<SortDropdown />}>
            <Suspense
                fallback={
                    <TailSpin
                        visible={true}
                        height="80"
                        width="80"
                        color="#C9184A"
                        ariaLabel="tail-spin-loading"
                        radius="2"
                        wrapperClass="flex-1 self-stretch flex justify-center items-center"
                    />
                }
            >
                <Await resolve={loaderData.songData}>
                    {({ songs, totalPages }) => (
                        <SongsTable songs={songs} totalPages={totalPages} />
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default SongsPage;

export const loader = ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const page = searchParams.get("page");
    const searchQuery = {
        q: searchParams.get("q"),
        type: searchParams.get("type"),
        sortBy: searchParams.get("sortby"),
    };
    return defer({
        songData: getAllOrSearchSongs(searchQuery, page ? page : 1),
    });
};

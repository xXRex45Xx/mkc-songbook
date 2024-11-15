import MainBodyContainer from "../components/main-body-container.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";
import { Await, defer, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import { TailSpin } from "react-loader-spinner";
import SongsTable from "../components/songs-table.component";
import { useSelector } from "react-redux";
import { Button } from "flowbite-react";

import uploadMultipleIcon from "../assets/upload-multiple.svg";
import uploadSingleIcon from "../assets/upload-single.svg";
import { uploadButtonTheme } from "../config/button-theme.config";
import CustomTailSpin from "../components/custom-tail-spin.component";

const SongsPage = () => {
    const loaderData = useLoaderData();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.currentUser);
    return (
        <MainBodyContainer
            title={"Songs"}
            titleHelper={
                <div className="flex items-center gap-7">
                    {user?.role === "admin" && (
                        <>
                            <Button
                                color="failure"
                                className="text-nowrap focus:ring-0 h-full"
                                theme={uploadButtonTheme}
                                size="xs"
                                onClick={() => navigate("/albums/new")}
                            >
                                Upload Album
                                <img src={uploadMultipleIcon} alt="" />
                            </Button>
                            <Button
                                className="text-nowrap focus:ring-0 h-full border border-secondary text-secondary"
                                theme={uploadButtonTheme}
                                size="xs"
                                onClick={() => navigate("/songs/new")}
                            >
                                Upload Song
                                <img src={uploadSingleIcon} alt="" />
                            </Button>
                        </>
                    )}
                    <SortDropdown />
                </div>
            }
        >
            <Suspense fallback={<CustomTailSpin />}>
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

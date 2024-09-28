import MainBodyContainer from "../components/main-body-container.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";
import CustomTable from "../components/custom-table.component";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRef } from "react";

import useWindowSize from "../hooks/useWindowSize.hook";
import SongsTableRow from "../components/custom-row.component";

const SongsPage = () => {
    const { songs, totalPages } = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const windowWidth = useSelector((state) => state.configs.windowWidth);
    useWindowSize();

    const neutralTableRef = useRef();
    const titleTableRef = useRef();

    const tableHeaders =
        windowWidth >= 768
            ? [
                  { align: "left", name: "SONG NUMBER" },
                  { align: "left", name: "SONG NAME" },
                  { align: "left", name: "ALBUMS" },
                  { align: "right", name: "DOWNLOAD" },
              ]
            : [];
    return (
        <MainBodyContainer title={"Songs"} titleHelper={<SortDropdown />}>
            {searchParams.get("type") !== "all" && (
                <CustomTable
                    headers={tableHeaders}
                    overflowAuto
                    pagination
                    totalPages={totalPages}
                    onPageChange={(p) => {
                        setSearchParams((prev) => {
                            prev.set("page", p);
                            return prev;
                        });
                        neutralTableRef.current.scrollIntoView({
                            behavior: "smooth",
                        });
                    }}
                    currentPage={
                        searchParams.get("page")
                            ? parseInt(searchParams.get("page"))
                            : 1
                    }
                    ref={neutralTableRef}
                >
                    {songs.map((song) => (
                        <SongsTableRow
                            key={song._id + song.title}
                            song={song}
                            highlight={searchParams.get("type") === "lyrics"}
                        />
                    ))}
                </CustomTable>
            )}

            {searchParams.get("type") === "all" && (
                <>
                    {songs.titleMatch.length !== 0 && (
                        <CustomTable
                            title="Title Search Results"
                            headers={tableHeaders}
                            ref={titleTableRef}
                        >
                            {songs.titleMatch.map((song) => (
                                <SongsTableRow
                                    key={song._id + song.title}
                                    song={song}
                                    highlight={false}
                                />
                            ))}
                        </CustomTable>
                    )}
                    {songs.lyricsMatch.length !== 0 && (
                        <CustomTable
                            title="Lyrics Search Results"
                            headers={tableHeaders}
                            pagination
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                setSearchParams((prev) => {
                                    prev.set("page", p);
                                    return prev;
                                });
                                titleTableRef.current.scrollIntoView({
                                    behavior: "smooth",
                                });
                            }}
                            currentPage={
                                searchParams.get("page")
                                    ? parseInt(searchParams.get("page"))
                                    : 1
                            }
                        >
                            {songs.lyricsMatch.map((song) => (
                                <SongsTableRow
                                    key={song._id + song.title}
                                    song={song}
                                    highlight={true}
                                />
                            ))}
                        </CustomTable>
                    )}
                </>
            )}
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
    return getAllOrSearchSongs(searchQuery, page ? page : 1);
};

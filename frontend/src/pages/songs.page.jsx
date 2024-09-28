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
    const songData = useLoaderData();
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
                    totalPages={songData.totalPages}
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
                    {/* {mapSongs(songData, searchParams.get("type") === "lyrics")} */}
                    {songData.songs.map((song) => (
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
                    <h2 className="text-baseblack text-2xl font-bold leading-9">
                        Title Search Results
                    </h2>
                    <CustomTable headers={tableHeaders} ref={titleTableRef}>
                        {/* {mapSongs(songData.titleMatch, false)} */}
                        {songData.songs.titleMatch.map((song) => (
                            <SongsTableRow
                                key={song._id + song.title}
                                song={song}
                                highlight={false}
                            />
                        ))}
                    </CustomTable>
                    <h2 className="text-baseblack text-2xl font-bold leading-9">
                        Lyrics Search Results
                    </h2>
                    <CustomTable
                        headers={tableHeaders}
                        pagination
                        totalPages={songData.totalPages}
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
                        {/* {mapSongs(songData.lyricsMatch, true)} */}
                        {songData.songs.lyricsMatch.map((song) => (
                            <SongsTableRow
                                key={song._id + song.title}
                                song={song}
                                highlight={true}
                            />
                        ))}
                    </CustomTable>
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

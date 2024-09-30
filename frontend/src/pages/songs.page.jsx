import MainBodyContainer from "../components/main-body-container.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";
import CustomTable from "../components/custom-table.component";
import {
    Await,
    defer,
    useLoaderData,
    useLocation,
    useNavigate,
    useNavigation,
    useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Suspense, useRef } from "react";
import { TailSpin } from "react-loader-spinner";

import useWindowSize from "../hooks/useWindowSize.hook";
import SongsTableRow from "../components/custom-row.component";

const SongsPage = () => {
    const loaderData = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const windowWidth = useSelector((state) => state.configs.windowWidth);
    useWindowSize();
    const { state: navState } = useNavigation();

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
                        <>
                            {navState === "loading" && (
                                <TailSpin
                                    visible={true}
                                    height="80"
                                    width="80"
                                    color="#C9184A"
                                    ariaLabel="tail-spin-loading"
                                    radius="2"
                                    wrapperClass="flex-1 self-stretch flex justify-center items-center"
                                />
                            )}
                            {navState !== "loading" &&
                                searchParams.get("type") !== "all" && (
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
                                            neutralTableRef.current.scrollIntoView(
                                                {
                                                    behavior: "smooth",
                                                }
                                            );
                                        }}
                                        currentPage={
                                            searchParams.get("page")
                                                ? parseInt(
                                                      searchParams.get("page")
                                                  )
                                                : 1
                                        }
                                        ref={neutralTableRef}
                                    >
                                        {songs.map((song) => (
                                            <SongsTableRow
                                                key={song._id + song.title}
                                                song={song}
                                                highlight={
                                                    searchParams.get("type") ===
                                                    "lyrics"
                                                }
                                            />
                                        ))}
                                    </CustomTable>
                                )}

                            {navState !== "loading" &&
                                searchParams.get("type") === "all" && (
                                    <>
                                        {songs.titleMatch.length !== 0 && (
                                            <CustomTable
                                                title="Title Search Results"
                                                headers={tableHeaders}
                                                ref={titleTableRef}
                                            >
                                                {songs.titleMatch.map(
                                                    (song) => (
                                                        <SongsTableRow
                                                            key={
                                                                song._id +
                                                                song.title
                                                            }
                                                            song={song}
                                                            highlight={false}
                                                        />
                                                    )
                                                )}
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
                                                    titleTableRef.current.scrollIntoView(
                                                        {
                                                            behavior: "smooth",
                                                        }
                                                    );
                                                }}
                                                currentPage={
                                                    searchParams.get("page")
                                                        ? parseInt(
                                                              searchParams.get(
                                                                  "page"
                                                              )
                                                          )
                                                        : 1
                                                }
                                            >
                                                {songs.lyricsMatch.map(
                                                    (song) => (
                                                        <SongsTableRow
                                                            key={
                                                                song._id +
                                                                song.title
                                                            }
                                                            song={song}
                                                            highlight={true}
                                                        />
                                                    )
                                                )}
                                            </CustomTable>
                                        )}
                                    </>
                                )}
                        </>
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

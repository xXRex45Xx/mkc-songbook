import { useRef } from "react";
import {
    useSearchParams,
    useNavigation,
    useRevalidator,
} from "react-router-dom";
import { useSelector } from "react-redux";
import useWindowSize from "../hooks/useWindowSize.hook";
import CustomTable from "./custom-table.component";
import SongsTableRow from "./custom-row.component";
import CustomTailSpin from "./custom-tail-spin.component";

const SongsTable = ({ songs, totalPages }) => {
    const neutralTableRef = useRef();
    const titleTableRef = useRef();
    const windowWidth = useSelector((state) => state.configs.windowWidth);
    useWindowSize();
    const [searchParams, setSearchParams] = useSearchParams();
    const { state: navState } = useNavigation();
    const { state: revalidateState } = useRevalidator();
    const tableHeaders =
        windowWidth >= 768
            ? [
                  { align: "left", name: "SONG NUMBER" },
                  { align: "left", name: "SONG NAME" },
                  { align: "left", name: "ALBUMS" },
                  { align: "right", name: "ACTIONS" },
              ]
            : [];

    return (
        <>
            {(navState === "loading" || revalidateState === "loading") && (
                <CustomTailSpin />
            )}
            {navState !== "loading" &&
                revalidateState !== "loading" &&
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
                                highlight={
                                    searchParams.get("type") === "lyrics"
                                }
                            />
                        ))}
                    </CustomTable>
                )}

            {navState !== "loading" &&
                revalidateState !== "loading" &&
                searchParams.get("type") === "all" && (
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
        </>
    );
};

export default SongsTable;

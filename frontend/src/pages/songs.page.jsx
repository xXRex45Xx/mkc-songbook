import MainBodyContainer from "../components/main-body-container.component";
import { Table } from "flowbite-react";

import CustomTable from "../components/custom-table.component";
import { useCallback } from "react";

import HeartSvg from "../assets/heart.svg?react";
import DownloadSvg from "../assets/download.svg?react";
import OptionsSvg from "../assets/options.svg?react";
import {
    useLoaderData,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";
import SortDropdown from "../components/sort-dropdown.component";

const SongsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const songData = useLoaderData();
    const [searchParams, _setSearchParams] = useSearchParams();

    const mapSongs = useCallback(
        (songs, highlight) =>
            songs.map((song) => (
                <Table.Row
                    onClick={() =>
                        navigate(
                            {
                                pathname: song._id.toString(),
                                search: highlight
                                    ? `?q=${searchParams.get("q")}`
                                    : null,
                            },
                            {
                                state: {
                                    prevLocation:
                                        location.pathname + location.search,
                                },
                            }
                        )
                    }
                    key={song._id}
                >
                    <Table.Cell>{song._id}</Table.Cell>
                    <Table.Cell>{song.title}</Table.Cell>
                    <Table.Cell>
                        {song.albums.map((song) => song.name).join(", ")}
                    </Table.Cell>
                    <Table.Cell className="text-end">
                        <div className="flex gap-7 items-center justify-end">
                            <div>
                                <HeartSvg className="first:stroke-baseblack first:fill-basewhite hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer" />
                            </div>
                            <div>
                                <DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
                            </div>
                            <div>
                                <OptionsSvg className="text-basewhite hover:text-neutrals-400 active:text-baseblack cursor-pointer" />
                            </div>
                        </div>
                    </Table.Cell>
                </Table.Row>
            )),
        [navigate, location, searchParams]
    );
    return (
        <MainBodyContainer title={"Songs"} titleHelper={<SortDropdown />}>
            {searchParams.get("type") !== "all" && (
                <CustomTable
                    headers={[
                        { align: "left", name: "SONG NUMBER" },
                        { align: "left", name: "SONG NAME" },
                        { align: "left", name: "ALBUMS" },
                        { align: "right", name: "DOWNLOAD" },
                    ]}
                    overflow_auto
                >
                    {mapSongs(songData, searchParams.get("type") === "lyrics")}
                </CustomTable>
            )}

            {searchParams.get("type") === "all" && (
                <>
                    <h2 className="text-baseblack text-2xl font-bold leading-9">
                        Title Search Results
                    </h2>
                    <CustomTable
                        headers={[
                            { align: "left", name: "SONG NUMBER" },
                            { align: "left", name: "SONG NAME" },
                            { align: "left", name: "ALBUMS" },
                            { align: "right", name: "DOWNLOAD" },
                        ]}
                    >
                        {mapSongs(songData.titleMatch, false)}
                    </CustomTable>
                    <h2 className="text-baseblack text-2xl font-bold leading-9">
                        Lyrics Search Results
                    </h2>
                    <CustomTable
                        headers={[
                            { align: "left", name: "SONG NUMBER" },
                            { align: "left", name: "SONG NAME" },
                            { align: "left", name: "ALBUMS" },
                            { align: "right", name: "DOWNLOAD" },
                        ]}
                    >
                        {mapSongs(songData.lyricsMatch, true)}
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

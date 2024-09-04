import MainBodyContainer from "../components/main-body-container.component";
import { Table } from "flowbite-react";

import CustomTable from "../components/custom-table.component";
import { useMemo } from "react";

import HeartSvg from "../assets/heart.svg?react";
import DownloadSvg from "../assets/download.svg?react";
import OptionsSvg from "../assets/options.svg?react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../components/search-bar.component";
import { getAllOrSearchSongs } from "../utils/api/songs-api.util";

const SongsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const songData = useLoaderData();

    return (
        <MainBodyContainer title={"Songs"}>
            <SearchBar />
            <CustomTable
                headers={[
                    { align: "left", name: "SONG NUMBER" },
                    { align: "left", name: "SONG NAME" },
                    { align: "left", name: "ALBUMS" },
                    { align: "right", name: "DOWNLOAD" },
                ]}
            >
                {songData.map((song) => (
                    <Table.Row
                        onClick={() =>
                            navigate(song._id.toString(), {
                                state: { prevLocation: location.pathname },
                            })
                        }
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
                ))}
            </CustomTable>
        </MainBodyContainer>
    );
};

export default SongsPage;

export const loader = ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const page = searchParams.get("page");
    const searchQuery = { q: searchParams.get("q") };
    return getAllOrSearchSongs(searchQuery, page ? page : 1);
};

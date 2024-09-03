import MainBodyContainer from "../components/main-body-container.component";
import { Table } from "flowbite-react";

import CustomTable from "../components/custom-table.component";
import { useMemo } from "react";

import HeartSvg from "../assets/heart.svg?react";
import DownloadSvg from "../assets/download.svg?react";
import OptionsSvg from "../assets/options.svg?react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../components/search-bar.component";

const SongsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    console.log(location);
    const songs = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 20; i++) {
            temp.push({ id: 5, title: "Song name", album: "album name" });
        }
        return temp;
    }, []);
    return (
        <MainBodyContainer title={"Songs"}>
            <SearchBar />
            <CustomTable
                headers={[
                    { align: "left", name: "SONG NUMBER" },
                    { align: "left", name: "SONG NAME" },
                    { align: "left", name: "ALBUM" },
                    { align: "right", name: "DOWNLOAD" },
                ]}
            >
                {songs.map((song) => (
                    <Table.Row
                        onClick={() =>
                            navigate(song.id.toString(), {
                                state: { prevLocation: location.pathname },
                            })
                        }
                    >
                        <Table.Cell>{song.id}</Table.Cell>
                        <Table.Cell>{song.title}</Table.Cell>
                        <Table.Cell>{song.album}</Table.Cell>
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

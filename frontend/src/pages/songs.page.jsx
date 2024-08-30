import MainBodyContainer from "../components/main-body-container.component";
import { TextInput, Select, Table } from "flowbite-react";
import { searchInputTheme, selectTheme } from "../config/forms-theme.config";
import CustomTable from "../components/custom-table.component";
import { useMemo } from "react";

import searchIcon from "../assets/search.svg";
import HeartSvg from "../assets/heart.svg?react";
import DownloadSvg from "../assets/download.svg?react";
import OptionsSvg from "../assets/options.svg?react";

const SongsPage = () => {
    const songs = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 20; i++) {
            temp.push({ id: 5, title: "Song name", album: "album name" });
        }
        return temp;
    }, []);
    return (
        <MainBodyContainer title={"Songs"}>
            <form>
                <div className="flex items-stretch">
                    <Select theme={selectTheme} id="categories" required>
                        <option selected>All Categories</option>
                        <option>Id</option>
                        <option>Title</option>
                        <option>Lyrics</option>
                    </Select>
                    <div className="w-full flex flex-nowrap">
                        <TextInput
                            theme={searchInputTheme}
                            placeholder="Search..."
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center p-2 w-10 h-full bg-secondary rounded-e-lg border border-secondary hover:bg-secondary-600 hover:border-secondary-600 focus:outline-none"
                        >
                            <img src={searchIcon} alt="Search"></img>
                        </button>
                    </div>
                </div>
            </form>
            <CustomTable
                headers={[
                    { align: "left", name: "SONG NUMBER" },
                    { align: "left", name: "SONG NAME" },
                    { align: "left", name: "ALBUM" },
                    { align: "right", name: "DOWNLOAD" },
                ]}
            >
                {songs.map((song) => (
                    <Table.Row>
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

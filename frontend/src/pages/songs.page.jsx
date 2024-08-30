import MainBodyContainer from "../components/main-body-container.component";
import { TextInput, Select, Table } from "flowbite-react";
import { searchInputTheme, selectTheme } from "../config/forms-theme.config";

import searchIcon from "../assets/search.svg";
import CustomTable from "../components/custom-table.component";
import { useMemo } from "react";

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
                headers={["SONG NUMBER", "SONG NAME", "ALBUM", "DOWNLOAD"]}
            >
                {songs.map((song) => (
                    <Table.Row>
                        <Table.Cell>{song.id}</Table.Cell>
                        <Table.Cell>{song.title}</Table.Cell>
                        <Table.Cell>{song.album}</Table.Cell>
                    </Table.Row>
                ))}
            </CustomTable>
        </MainBodyContainer>
    );
};

export default SongsPage;

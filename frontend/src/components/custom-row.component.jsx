import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table } from "flowbite-react";
import SongTools from "./song-tools.component";

const SongsTableRow = ({ song, highlight }) => {
    const navigate = useNavigate();
    const [searchParams, _setSearchParams] = useSearchParams();
    const windowWidth = useSelector((state) => state.configs.windowWidth);

    return (
        <Table.Row
            onClick={() =>
                navigate({
                    pathname: song._id.toString(),
                    search: highlight ? `?q=${searchParams.get("q")}` : null,
                })
            }
            key={song._id}
        >
            <Table.Cell>{song._id}</Table.Cell>
            <Table.Cell>
                {song.title}
                {windowWidth < 768 && <br />}
                {windowWidth < 768 &&
                    song.albums.map((song) => song.name).join(", ")}
            </Table.Cell>
            {windowWidth >= 768 && (
                <Table.Cell>
                    {song.albums.map((song) => song.name).join(", ")}
                </Table.Cell>
            )}
            <Table.Cell className="text-end flex justify-end">
                <SongTools />
            </Table.Cell>
        </Table.Row>
    );
};

export default SongsTableRow;

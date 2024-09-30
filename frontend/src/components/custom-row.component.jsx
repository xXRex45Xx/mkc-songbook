import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table } from "flowbite-react";

import OptionsSvg from "../assets/options.svg?react";
import HeartSvg from "../assets/heart.svg?react";
import DownloadSvg from "../assets/download.svg?react";

const SongsTableRow = ({ song, highlight }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useSearchParams();
    const windowWidth = useSelector((state) => state.configs.windowWidth);

    return (
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
                            prevLocation: location.pathname + location.search,
                        },
                    }
                )
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
            <Table.Cell className="text-end">
                <div className="flex gap-7 items-center justify-end">
                    {windowWidth >= 768 && (
                        <>
                            <div>
                                <HeartSvg className="first:stroke-baseblack first:fill-basewhite hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer" />
                            </div>
                            <div>
                                <DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
                            </div>
                        </>
                    )}
                    <div>
                        <OptionsSvg className="text-basewhite hover:text-neutrals-400 active:text-baseblack cursor-pointer" />
                    </div>
                </div>
            </Table.Cell>
        </Table.Row>
    );
};

export default SongsTableRow;

import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table } from "flowbite-react";
import SongTools from "./song-tools.component";

/**
 * Songs Table Row Component
 *
 * A responsive table row component for displaying song information.
 * Features:
 * - Clickable row for navigation to song details
 * - Responsive layout (collapses album info on mobile)
 * - Song tools integration
 * - Search parameter preservation
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.song - Song data to display
 * @param {string} props.song._id - Song identifier
 * @param {string} props.song.title - Song title
 * @param {Array<{name: string}>} props.song.albums - List of albums the song belongs to
 * @param {boolean} props.highlight - Whether to include search term in navigation
 */
const SongsTableRow = ({
	song,
	highlight,
	showDelete,
	deleteDescription,
	onDelete,
}) => {
	const navigate = useNavigate();
	const [searchParams, _setSearchParams] = useSearchParams();

	/**
	 * Window width from Redux store for responsive layout decisions
	 */
	const windowWidth = useSelector((state) => state.configs.windowWidth);

	return (
		<Table.Row
			onClick={() =>
				navigate({
					pathname: `/songs/${song._id.toString()}`,
					search: highlight ? `?q=${searchParams.get("q")}` : null,
				})
			}
			key={song._id}
			className="cursor-pointer"
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
				<SongTools
					songId={song._id}
					showDelete={showDelete}
					deleteDescription={deleteDescription}
					onDelete={onDelete}
				/>
			</Table.Cell>
		</Table.Row>
	);
};

export default SongsTableRow;

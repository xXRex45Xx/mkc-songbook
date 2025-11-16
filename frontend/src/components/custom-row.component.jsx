import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table } from "flowbite-react";
import SongTools from "./song-tools.component";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import FirstDroppableRow from "./first-droppable-row.component";

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
	draggable,
	idx,
	showPlayButton,
	onPlay,
}) => {
	const navigate = useNavigate();
	const [searchParams, _setSearchParams] = useSearchParams();
	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id: idx + 1,
	});
	const {
		setNodeRef: setDraggableRef,
		attributes,
		listeners,
		transform,
		isDragging,
	} = useDraggable({ id: idx });

	const dragTransformStyles = {
		transform: CSS.Translate.toString(transform),
	};
	/**
	 * Window width from Redux store for responsive layout decisions
	 */
	const windowWidth = useSelector((state) => state.configs.windowWidth);

	return (
		<>
			{idx === 0 && draggable && (
				<FirstDroppableRow disabled={idx === 0 && isDragging} />
			)}
			<Table.Row
				key={song._id}
				className={"cursor-pointer touch-manipulation"}
				ref={draggable ? setDraggableRef : undefined}
				{...(draggable ? attributes : {})}
				{...(draggable ? listeners : {})}
				onClick={() =>
					navigate({
						pathname: `/songs/${song._id.toString()}`,
						search: highlight ? `?q=${searchParams.get("q")}` : null,
					})
				}
				style={draggable ? dragTransformStyles : undefined}
			>
				<Table.Cell
					className={draggable && isDragging ? "tranform scale-105" : ""}
				>
					{song._id}
				</Table.Cell>
				<Table.Cell
					className={draggable && isDragging ? "tranform scale-105" : ""}
				>
					{song.title}
					{windowWidth < 768 && <br />}
					{windowWidth < 768 &&
						song.albums.map((song) => song.name).join(", ")}
				</Table.Cell>
				{windowWidth >= 768 && (
					<Table.Cell
						className={
							draggable && isDragging ? "tranform scale-105" : ""
						}
					>
						{song.albums.map((song) => song.name).join(", ")}
					</Table.Cell>
				)}
				<Table.Cell
					className={
						draggable && isDragging
							? "text-end flex justify-end tranform scale-105"
							: "text-end flex justify-end"
					}
				>
					<SongTools
						song={song}
						showDelete={showDelete}
						deleteDescription={deleteDescription}
						onDelete={onDelete}
						showPlayButton={showPlayButton}
						onPlay={onPlay}
					/>
				</Table.Cell>
			</Table.Row>
			{draggable && (
				<Table.Row
					ref={setDroppableRef}
					className={isOver && !isDragging ? "h-10" : "h-0.5"}
				></Table.Row>
			)}
		</>
	);
};

export default SongsTableRow;

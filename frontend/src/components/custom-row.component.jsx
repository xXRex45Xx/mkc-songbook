/**
 * @fileoverview Custom row component for songs table with drag-and-drop support
 * Displays song information with responsive layout and action buttons
 */

import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "flowbite-react";
import SongTools from "./song-tools.component";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import FirstDroppableRow from "./first-droppable-row.component";
import { removeSong, setCurrentSongIdx } from "../store/slices/playlist.slice";
import PlaySmallSvg from "../assets/play-small.svg?react";
import deleteIcon from "../assets/delete.svg";

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
 * @param {boolean} [props.showDelete] - Whether to show delete button
 * @param {string} [props.deleteDescription] - Description for delete action
 * @param {Function} [props.onDelete] - Delete callback function
 * @param {boolean} [props.draggable] - Whether row is draggable
 * @param {number} [props.idx] - Row index for drag operations
 * @param {boolean} [props.showPlayButton] - Whether to show play button
 * @param {Function} [props.onPlay] - Play callback function
 * @param {boolean} [props.queueTools] - Whether to show queue management tools
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
	queueTools,
}) => {
	const dispatch = useDispatch();
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
	const downloadPercent = useSelector(
		(state) => state.pwa.audioDownloads[song._id]
	);
	const isDownloading = downloadPercent !== undefined;

	return (
		<>
			{idx === 0 && draggable && (
				<FirstDroppableRow disabled={idx === 0 && isDragging} />
			)}
			<Table.Row
				key={song._id}
				className={`cursor-pointer touch-manipulation transition-opacity ${
					isDownloading ? "opacity-40" : ""
				}`}
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
					className={`max-md:w-12 max-md:px-2 max-md:py-3 max-md:text-xs max-md:text-neutrals-800 whitespace-nowrap ${
						draggable && isDragging ? "tranform scale-105" : ""
					}`}
				>
					{song._id}
				</Table.Cell>
				<Table.Cell
					className={`max-md:px-2 max-md:py-3 ${
						draggable && isDragging ? "tranform scale-105" : ""
					}`}
				>
					{song.title}
				</Table.Cell>
				{windowWidth >= 768 && (
					<Table.Cell
						className={
							draggable && isDragging ? "tranform scale-105" : ""
						}
					>
						{(song.albums || []).map((album) => album.name).join(", ")}
					</Table.Cell>
				)}
				<Table.Cell
					className={
						draggable && isDragging
							? "text-end flex justify-end tranform scale-105 max-md:px-2 max-md:py-3"
							: "text-end flex justify-end max-md:px-2 max-md:py-3"
					}
				>
					{queueTools ? (
						<div
							onClick={(e) => e.stopPropagation()}
							className="flex gap-7 items-center w-fit"
						>
							<button
								className="cursor-pointer"
								onClick={() => dispatch(setCurrentSongIdx(idx))}
							>
								<PlaySmallSvg className="hover:first:fill-secondary-600 active:first:fill-secondary-700" />
							</button>
							<button
								className="cursor-pointer"
								onClick={() => dispatch(removeSong(song._id))}
							>
								<img src={deleteIcon} alt="delete" />
							</button>
						</div>
					) : (
						<SongTools
							song={song}
							showDelete={showDelete}
							deleteDescription={deleteDescription}
							onDelete={onDelete}
							showPlayButton={showPlayButton}
							onPlay={onPlay}
						/>
					)}
				</Table.Cell>
			</Table.Row>
			{isDownloading && (
				<Table.Row className="hover:bg-transparent">
					<Table.Cell
						colSpan={windowWidth >= 768 ? 4 : 3}
						className="py-2 max-md:px-2"
					>
						<div className="flex flex-col gap-1">
							<span className="self-end text-xs font-semibold text-neutrals-800">
								{downloadPercent}%
							</span>
							<div
								role="progressbar"
								aria-label={`Saving ${song.title} offline`}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={downloadPercent}
								className="h-2 w-full rounded-full bg-neutrals-100"
							>
								<div
									className="h-full rounded-full bg-success-200 transition-[width] duration-200"
									style={{ width: `${downloadPercent}%` }}
								/>
							</div>
						</div>
					</Table.Cell>
				</Table.Row>
			)}
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

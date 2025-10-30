import { useRef } from "react";
import {
	useSearchParams,
	useNavigation,
	useRevalidator,
} from "react-router-dom";
import { useSelector } from "react-redux";
import useWindowSize from "../hooks/useWindowSize.hook";
import CustomTable from "./custom-table.component";
import SongsTableRow from "./custom-row.component";
import CustomTailSpin from "./custom-tail-spin.component";

/**
 * Songs Table Component
 *
 * Displays a responsive table of songs with search results and pagination.
 * Features:
 * - Responsive layout with different headers for mobile/desktop
 * - Separate tables for title and lyrics search results
 * - Pagination with smooth scroll to top
 * - Loading states during navigation and revalidation
 * - Highlight support for lyrics search matches
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.songs - Array of song objects to display
 * @param {number} props.totalPages - Total number of pages for pagination
 */
const SongsTable = ({
	songs,
	totalPages,
	showOverflow,
	showDelete,
	deleteDescription,
	onDelete,
}) => {
	/**
	 * Refs for table scroll behavior
	 */
	const neutralTableRef = useRef();
	const titleTableRef = useRef();

	/**
	 * Window width from Redux store for responsive layout
	 */
	const windowWidth = useSelector((state) => state.configs.windowWidth);
	useWindowSize();
	const [searchParams, setSearchParams] = useSearchParams();
	const { state: navState } = useNavigation();
	const { state: revalidateState } = useRevalidator();

	/**
	 * Table headers configuration based on screen width
	 * Shows headers only on desktop (>= 768px)
	 */
	const tableHeaders =
		windowWidth >= 768
			? [
					{ align: "left", name: "SONG NUMBER" },
					{ align: "left", name: "SONG NAME" },
					{ align: "left", name: "ALBUMS" },
					{ align: "right", name: "ACTIONS" },
			  ]
			: [];

	return (
		<>
			{(navState === "loading" || revalidateState === "loading") && (
				<CustomTailSpin />
			)}
			{navState !== "loading" &&
				revalidateState !== "loading" &&
				searchParams.get("type") !== "all" && (
					<CustomTable
						headers={tableHeaders}
						overflowAuto={showOverflow ? false : true}
						pagination
						totalPages={totalPages}
						onPageChange={(p) => {
							setSearchParams((prev) => {
								prev.set("page", p);
								return prev;
							});
							neutralTableRef.current.scrollIntoView({
								behavior: "smooth",
							});
						}}
						currentPage={
							searchParams.get("page")
								? parseInt(searchParams.get("page"))
								: 1
						}
						ref={neutralTableRef}
					>
						{songs.map((song) => (
							<SongsTableRow
								key={song._id + song.title}
								song={song}
								highlight={searchParams.get("type") === "lyrics"}
								showDelete={showDelete}
								deleteDescription={deleteDescription}
								onDelete={onDelete}
							/>
						))}
					</CustomTable>
				)}

			{navState !== "loading" &&
				revalidateState !== "loading" &&
				searchParams.get("type") === "all" && (
					<>
						{songs.titleMatch.length !== 0 && (
							<CustomTable
								title="Title Search Results"
								headers={tableHeaders}
								ref={titleTableRef}
							>
								{songs.titleMatch.map((song) => (
									<SongsTableRow
										key={song._id + song.title}
										song={song}
										highlight={false}
									/>
								))}
							</CustomTable>
						)}
						{songs.lyricsMatch.length !== 0 && (
							<CustomTable
								title="Lyrics Search Results"
								headers={tableHeaders}
								pagination
								totalPages={totalPages}
								onPageChange={(p) => {
									setSearchParams((prev) => {
										prev.set("page", p);
										return prev;
									});
									titleTableRef.current.scrollIntoView({
										behavior: "smooth",
									});
								}}
								currentPage={
									searchParams.get("page")
										? parseInt(searchParams.get("page"))
										: 1
								}
							>
								{songs.lyricsMatch.map((song) => (
									<SongsTableRow
										key={song._id + song.title}
										song={song}
										highlight={true}
									/>
								))}
							</CustomTable>
						)}
					</>
				)}
		</>
	);
};

export default SongsTable;

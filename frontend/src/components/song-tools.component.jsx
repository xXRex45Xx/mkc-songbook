import { Button, Dropdown, Modal } from "flowbite-react";
import {
	createSearchParams,
	Form,
	Link,
	useLocation,
	useNavigate,
	useNavigation,
	useRevalidator,
} from "react-router-dom";
import OptionsSvg from "../assets/options.svg?react";
import HeartSvg from "../assets/heart.svg?react";
// import DownloadSvg from "../assets/download.svg?react";
// import videoSmallIcon from "../assets/video-small.svg";
import queueSmallIcon from "../assets/queue-small.svg";
// import nextSmallIcon from "../assets/next-small.svg";
import playlistIcon from "../assets/playlist.png";
import shareSmallIcon from "../assets/share-small.svg";
import addSmallIcon from "../assets/add-small.svg";
import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import addToPlaylistSmallIcon from "../assets/add-to-playlist.svg";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import CustomTailSpin from "./custom-tail-spin.component";
import { deleteSong } from "../utils/api/songs-api.util";
import PlaylistCard from "./playlist-card.component";
import { getAllPlaylists, patchPlaylist } from "../utils/api/playlist-api.util";
import { updateFavoriteSongs } from "../utils/api/user-api.util";
import { setUserFavorites } from "../store/slices/user.slice";
import { addSongToQueue } from "../store/slices/playlist.slice";

/**
 * Component for song interaction tools and options
 * Provides different functionality based on user role (admin/regular user)
 * Includes options for song management, playback control, and sharing
 * @param {Object} props - Component props
 * @param {Object} props.song- song to manage
 * @returns {JSX.Element} Song tools component
 */
const SongTools = ({ song, showDelete, deleteDescription, onDelete }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const revalidator = useRevalidator();
	const windowWidth = useSelector((state) => state.configs.windowWidth);
	const user = useSelector((state) => state.user.currentUser);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const [openAddToPlaylistModal, setOpenAddToPlaylistModal] = useState(false);
	const [addToPlaylistModalError, setAddToPlaylistModalError] = useState("");
	const [myPlaylists, setMyPlaylists] = useState([]);
	const [playlistModalLoading, setPlaylistModalLoading] = useState(false);

	const [isAddingToFavorite, setIsAddingToFavorite] = useState(false);

	const handleDeleteSong = async () => {
		setIsDeleting(true);
		try {
			await deleteSong(song._id);
			setOpenDeleteModal(false);
			revalidator.revalidate();
		} catch (error) {
			setDeleteError(error.message);
		} finally {
			setIsDeleting(false);
		}
	};
	const handleShare = async () => {
		try {
			await navigator.share({
				title: `MKC Choir Songbook Song - ${song.title}`,
				url: `${import.meta.env.VITE_CLIENT_URL}/songs/${song._id}`,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleOpenAddToPlaylistModal = async () => {
		if (!user) return navigate(`/auth?redirect=${location.pathname}`);
		setOpenAddToPlaylistModal(true);
		setPlaylistModalLoading(true);
		setAddToPlaylistModalError("");
		try {
			const playlists = await getAllPlaylists(null, null, true);
			setMyPlaylists(playlists);
		} catch (error) {
			setAddToPlaylistModalError(error.message);
		} finally {
			setPlaylistModalLoading(false);
		}
	};
	const handleSelectPlaylist = async (playlistId) => {
		setPlaylistModalLoading(true);
		setAddToPlaylistModalError("");
		try {
			await patchPlaylist(playlistId, null, [song._id]);
			alert("Song added to playlist successfully.");
			setMyPlaylists([]);
			setOpenAddToPlaylistModal(false);
		} catch (error) {
			if (error.message === "One or more songs are already in the playlist.")
				error.message = "Song is already in the playlist.";
			setAddToPlaylistModalError(error.message);
		} finally {
			setPlaylistModalLoading(false);
		}
	};

	const handleToggleFavorite = async () => {
		if (!user) return navigate(`/auth?redirect=${location.pathname}`);
		setIsAddingToFavorite(true);
		try {
			if (!user.favorites) user.favorites = [];
			if (user.favorites.includes(song._id)) {
				await updateFavoriteSongs(null, null, [song._id]);
				dispatch(
					setUserFavorites(
						user.favorites.filter((favSong) => favSong !== song._id)
					)
				);
			} else {
				await updateFavoriteSongs(null, [song._id]);
				dispatch(setUserFavorites(user.favorites.concat([song._id])));
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setIsAddingToFavorite(false);
		}
	};

	const handleAddToQueue = () => {
		if (song?.hasAudio) dispatch(addSongToQueue(song));
	};

	const favoriteIconStyle = useMemo(() => {
		let style =
			"hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer ";
		if (user?.favorites.includes(song._id))
			style += "first:stroke-basewhite first:fill-primary";
		else style += "first:stroke-baseblack first:fill-basewhite";
		return style;
	}, [user]);

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className="flex gap-7 items-center w-fit"
		>
			{!["admin", "super-admin"].includes(user?.role) && (
				<>
					{isAddingToFavorite ? (
						<CustomTailSpin xs />
					) : (
						<div onClick={handleToggleFavorite}>
							<HeartSvg className={favoriteIconStyle} />
						</div>
					)}
					{/* <div>
							<DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
						</div> */}
				</>
			)}
			{["admin", "super-admin"].includes(user?.role) ? (
				<>
					<Link to={`/songs/${song._id}/edit`} className="cursor-pointer">
						<img src={editIcon} alt="edit" />
					</Link>
					<button
						className="cursor-pointer"
						onClick={() => setOpenDeleteModal(true)}
					>
						<img src={deleteIcon} alt="delete" />
					</button>
					<Modal
						show={openDeleteModal}
						size="sm"
						onClose={() => setOpenDeleteModal(false)}
					>
						<Modal.Header>Delete Song?</Modal.Header>
						<Modal.Body>
							<p className="text-baseblack">This can't be undone!</p>
							{deleteError && (
								<p className="text-secondary mt-2">{deleteError}</p>
							)}
						</Modal.Body>
						<Modal.Footer className="flex justify-end">
							<Button
								size="sm"
								color="light"
								className="focus:ring-0"
								onClick={() => setOpenDeleteModal(false)}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								color="failure"
								className="focus:ring-0"
								type="submit"
								isProcessing={isDeleting}
								processingSpinner={<CustomTailSpin small white />}
								onClick={handleDeleteSong}
							>
								Delete
							</Button>
						</Modal.Footer>
					</Modal>
				</>
			) : (
				<Dropdown
					arrowIcon={false}
					inline
					label={
						<OptionsSvg className="text-basewhite hover:text-neutrals-400 active:text-baseblack cursor-pointer" />
					}
				>
					{song?.hasAudio && (
						<Dropdown.Item
							className="flex gap-1.5"
							onClick={handleAddToQueue}
						>
							<img src={queueSmallIcon} alt="" />
							Add To Queue
						</Dropdown.Item>
					)}
					{/* <Dropdown.Item className="flex gap-1.5">
						<img src={videoSmallIcon} alt=""></img>Play Video
					</Dropdown.Item>
					
					<Dropdown.Item className="flex gap-1.5">
						<img src={nextSmallIcon} alt="" />
						Play Next
					</Dropdown.Item> */}
					<Dropdown.Item className="flex gap-1.5" onClick={handleShare}>
						<img src={shareSmallIcon} alt="" />
						Share
					</Dropdown.Item>
					<Dropdown.Item
						className="flex gap-1.5"
						onClick={handleOpenAddToPlaylistModal}
					>
						<img src={addToPlaylistSmallIcon} alt="" />
						Add To Playlist
					</Dropdown.Item>
					<Dropdown.Item
						className="flex gap-1.5"
						onClick={() =>
							navigate({
								pathname: "/playlists/new",
								search: createSearchParams({
									songId: song._id,
									songTitle: song.title,
								}).toString(),
							})
						}
					>
						<img src={addSmallIcon} alt="" />
						New Playlist
					</Dropdown.Item>
					{showDelete && (
						<>
							<Dropdown.Divider />
							<Dropdown.Item
								className="flex gap-1.5"
								onClick={onDelete.bind(null, song._id)}
							>
								<img src={deleteIcon} alt="" />
								{deleteDescription}
							</Dropdown.Item>
						</>
					)}
				</Dropdown>
			)}
			<Modal
				show={openAddToPlaylistModal}
				size="7xl"
				onClose={() => {
					setOpenAddToPlaylistModal(false);
					setPlaylistModalLoading(false);
					setMyPlaylists([]);
					setAddToPlaylistModalError("");
				}}
			>
				<Modal.Header>Choose Playlist</Modal.Header>
				<Modal.Body>
					{playlistModalLoading ? (
						<CustomTailSpin />
					) : (
						<div className="flex flex-wrap gap-6">
							{myPlaylists.map((playlist) => (
								<PlaylistCard
									key={playlist._id}
									id={playlist._id}
									title={playlist.name}
									numOfSongs={playlist.numOfSongs}
									imgSrc={playlistIcon}
									onClick={handleSelectPlaylist.bind(
										null,
										playlist._id
									)}
								/>
							))}
						</div>
					)}
					{addToPlaylistModalError && (
						<p className="text-secondary mt-2">
							{addToPlaylistModalError}
						</p>
					)}
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default SongTools;

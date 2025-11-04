import HorizontalPlaylistCard from "./horizontal-playlist-card.component";
import SongCollectionTools from "./song-collection-tools.component";
import SongsTable from "./songs-table.component";
import playlistIcon from "../assets/playlist.png";
import largeHeartIcon from "../assets/heart-large.svg";
import { useCallback, useState } from "react";
import { Button, Modal } from "flowbite-react";
import CustomTailSpin from "./custom-tail-spin.component";
import { useSelector } from "react-redux";
import { deletePlaylist, patchPlaylist } from "../utils/api/playlist-api.util";
import { useNavigate, useParams, useRevalidator } from "react-router-dom";

const PlaylistViewer = ({ playlist }) => {
	const { playlistId } = useParams();
	const revalidator = useRevalidator();
	const [playlistSongs, setPlaylistSongs] = useState(playlist.songs);
	const [openPreShareModal, setOpenPreShareModal] = useState(false);
	const [preShareModalError, setPreShareModalError] = useState("");
	const [openRemoveSongModal, setOpenRemoveSongModal] = useState(false);
	const [removeSongModalError, setRemoveSongModalError] = useState("");
	const [openDeletePlaylistModal, setOpenDeletePlaylistModal] =
		useState(false);
	const [deletePlaylistModalError, setDeletePlaylistModalError] =
		useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isRemovingSong, setIsRemovingSong] = useState(false);
	const [isDeletingPlaylist, setIsDeletingPlaylist] = useState(false);
	const [songToBeRemoved, setSongToBeRemoved] = useState(null);
	const user = useSelector((state) => state.user.currentUser);
	const navigate = useNavigate();

	const handleShare = async () => {
		if (playlist.visibility === "private") return setOpenPreShareModal(true);
		try {
			await navigator.share({
				title: `MKC Choir Songbook Playlist - ${playlist.name} by ${playlist.creator.name}`,
				url: window.location.href,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleUpdate = async (visibility) => {
		setIsUpdating(true);
		try {
			await patchPlaylist(playlist._id, visibility);
			setOpenPreShareModal(false);
			revalidator.revalidate();
		} catch (error) {
			setPreShareModalError(error.message);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleRemoveSong = useCallback(async () => {
		if (songToBeRemoved === null) return;
		setIsRemovingSong(true);
		try {
			await patchPlaylist(playlist._id, null, null, [songToBeRemoved]);
			setOpenRemoveSongModal(false);
			revalidator.revalidate();
		} catch (error) {
			setRemoveSongModalError(error.message);
		} finally {
			setIsRemovingSong(false);
		}
	}, [songToBeRemoved]);

	const handleDeletePlaylist = async () => {
		setIsDeletingPlaylist(true);
		try {
			await deletePlaylist(playlist._id);
			setIsDeletingPlaylist(false);
			navigate("/playlists");
		} catch (error) {
			setIsDeletingPlaylist(false);
			setDeletePlaylistModalError(error.message);
		}
	};

	const handleDragEnd = (e) => {
		const { active, over } = e;

		if (!over) return;

		const draggedIdx = active.id;
		const overIdx = over.id;

		if (draggedIdx === overIdx || draggedIdx === overIdx - 1) return;

		let tmp;

		if (overIdx === 0) {
			tmp = [playlistSongs[draggedIdx]];
			tmp = tmp.concat(playlistSongs.slice(0, draggedIdx));
			if (draggedIdx < playlistSongs.length - 1)
				tmp = tmp.concat(playlistSongs.slice(draggedIdx + 1));
		} else if (draggedIdx < overIdx - 1) {
			tmp = playlistSongs.slice(0, draggedIdx);
			tmp = tmp.concat(playlistSongs.slice(draggedIdx + 1, overIdx));
			tmp.push(playlistSongs[draggedIdx]);
			if (overIdx < playlistSongs.length) {
				tmp = tmp.concat(playlistSongs.slice(overIdx));
			}
		} else if (overIdx - 1 < draggedIdx) {
			tmp = playlistSongs.slice(0, overIdx);
			tmp.push(playlistSongs[draggedIdx]);
			tmp = tmp.concat(playlistSongs.slice(overIdx, draggedIdx));
			if (draggedIdx < playlistSongs.length - 1)
				tmp = tmp.concat(playlistSongs.slice(draggedIdx + 1));
		}
		setPlaylistSongs(tmp);
	};

	return (
		<div className="flex flex-col gap-5 w-full">
			<SongCollectionTools
				handleShare={handleShare}
				allowModify={
					user?.id === playlist.creator._id && playlistId !== "favorites"
				}
				allowShare={playlistId !== "favorites"}
				handleEdit={() => navigate("edit")}
				handleDelete={() => setOpenDeletePlaylistModal(true)}
			/>
			<HorizontalPlaylistCard
				name={playlist.name}
				creator={playlist.creator.name}
				numOfSongs={playlist.songs.length}
				visibility={
					playlist.visibility.charAt(0).toUpperCase() +
					playlist.visibility.slice(1)
				}
				imgSrc={playlistId === "favorites" ? largeHeartIcon : playlistIcon}
				favorites={playlistId === "favorites"}
			/>
			<SongsTable
				songs={playlistSongs}
				showOverflow
				showDelete={
					user?.id === playlist.creator._id && playlistId !== "favorites"
				}
				deleteDescription="Remove From Playlist"
				onDelete={(songId) => {
					setSongToBeRemoved(songId);
					setOpenRemoveSongModal(true);
				}}
				onDragEnd={handleDragEnd}
			/>
			{/*Pre share modal */}
			<Modal
				show={openPreShareModal}
				size="sm"
				onClose={() => setOpenPreShareModal(false)}
			>
				<Modal.Header>Change Visibility</Modal.Header>
				<Modal.Body>
					<p className="text-baseblack">
						This playlist is private and can't be accessed by other users.
						Please change the visibility first.
					</p>
					{preShareModalError && (
						<p className="text-secondary mt-2">{preShareModalError}</p>
					)}
				</Modal.Body>
				<Modal.Footer className="flex justify-end">
					<Button
						size="sm"
						color="light"
						className="focus:ring-0"
						onClick={() => setOpenPreShareModal(false)}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						color="failure"
						className="focus:ring-0"
						isProcessing={isUpdating}
						processingSpinner={<CustomTailSpin small white />}
						onClick={handleUpdate.bind(null, "public")}
					>
						Make Public
					</Button>
					{user?.role !== "public" && (
						<Button
							size="sm"
							color="failure"
							className="focus:ring-0"
							isProcessing={isUpdating}
							processingSpinner={<CustomTailSpin small white />}
							onClick={handleUpdate.bind(null, "members")}
						>
							Members Only
						</Button>
					)}
				</Modal.Footer>
			</Modal>
			{/*Remove song modal */}
			<Modal
				show={openRemoveSongModal}
				size="sm"
				onClose={() => {
					setOpenRemoveSongModal(false);
					setSongToBeRemoved(null);
				}}
			>
				<Modal.Header>Remove Song</Modal.Header>
				<Modal.Body>
					<p className="text-baseblack">You are about to remove a song.</p>
					{removeSongModalError && (
						<p className="text-secondary mt-2">{removeSongModalError}</p>
					)}
				</Modal.Body>
				<Modal.Footer className="flex justify-end">
					<Button
						size="sm"
						color="light"
						className="focus:ring-0"
						onClick={() => {
							setOpenRemoveSongModal(false);
							setSongToBeRemoved(null);
						}}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						color="failure"
						className="focus:ring-0"
						isProcessing={isRemovingSong}
						processingSpinner={<CustomTailSpin small white />}
						onClick={handleRemoveSong}
					>
						Remove Song
					</Button>
				</Modal.Footer>
			</Modal>
			{/*Delete playlist modal */}
			<Modal
				show={openDeletePlaylistModal}
				size="sm"
				onClose={() => setOpenDeletePlaylistModal(false)}
			>
				<Modal.Header>Delete Playlist</Modal.Header>
				<Modal.Body>
					<p className="text-baseblack">
						You are about to delete this playlist.
					</p>
					{deletePlaylistModalError && (
						<p className="text-secondary mt-2">
							{deletePlaylistModalError}
						</p>
					)}
				</Modal.Body>
				<Modal.Footer className="flex justify-end">
					<Button
						size="sm"
						color="light"
						className="focus:ring-0"
						onClick={() => setOpenDeletePlaylistModal(false)}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						color="failure"
						className="focus:ring-0"
						isProcessing={isDeletingPlaylist}
						processingSpinner={<CustomTailSpin small white />}
						onClick={handleDeletePlaylist}
					>
						Delete Playlist
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default PlaylistViewer;

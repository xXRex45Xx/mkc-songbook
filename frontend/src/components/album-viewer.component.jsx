import HorizontalAlbumCard from "./horizontal-album-card.component";
import backendURL from "../config/backend-url.config";
import SongsTable from "./songs-table.component";
import SongCollectionTools from "./song-collection-tools.component";
import { useDispatch, useSelector } from "react-redux";
import { setPlaylist } from "../store/slices/playlist.slice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Modal, Button } from "flowbite-react";
import CustomTailSpin from "./custom-tail-spin.component";
import { deleteAlbum } from "../utils/api/album-api.util";

const AlbumViewer = ({ album }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const queue = useSelector((state) => state.playlist.queue);
	const currentSongIdx = useSelector((state) => state.playlist.currentSongIdx);
	const user = useSelector((state) => state.user.currentUser);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const handleDeleteAlbum = async () => {
		setIsDeleting(true);
		try {
			await deleteAlbum(album._id);
			setOpenDeleteModal(false);
			navigate("/albums");
		} catch (error) {
			setDeleteError(error.message);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleShare = async () => {
		try {
			await navigator.share({
				title: `MKC Choir Songbook Album - ${album.name}`,
				url: window.location.href,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddToQueue = () => {
		if (queue.length === 0) dispatch(setPlaylist([...album.songs]));
		dispatch(setPlaylist([...queue, ...album.songs]));
	};
	const handlePlayNext = () => {
		if (queue.length === 0) dispatch(setPlaylist([...album.songs]));
		let tmp = queue.slice(0, currentSongIdx + 1);
		tmp = tmp.concat(album.songs);
		if (currentSongIdx < queue.length - 1)
			tmp = tmp.concat(queue.slice(currentSongIdx + 1));
		dispatch(setPlaylist(tmp));
	};
	return (
		<div className="flex flex-col gap-5 w-full">
			<SongCollectionTools
				handleShare={handleShare}
				allowModify={["admin", "super-admin"].includes(user?.role)}
				showPlayerTools={!["admin", "super-admin"].includes(user?.role)}
				handleAddToQueue={handleAddToQueue}
				handlePlayNext={handlePlayNext}
				allowShare
				handleEdit={() => navigate("edit")}
				handleDelete={() => setOpenDeleteModal(true)}
			/>
			<HorizontalAlbumCard
				title={album.name}
				year={album.createdAt}
				numOfSongs={album.songs.length}
				imgSrc={backendURL + album.photoLink}
			/>
			<SongsTable
				songs={album.songs.map((song) => ({ ...song, hasAudio: true }))}
				showOverflow
				showPlayButton
			/>
			<Modal
				show={openDeleteModal}
				size="sm"
				onClose={() => setOpenDeleteModal(false)}
			>
				<Modal.Header>Delete Album?</Modal.Header>
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
						onClick={handleDeleteAlbum}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default AlbumViewer;

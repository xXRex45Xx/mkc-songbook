import HorizontalPlaylistCard from "./horizontal-playlist-card.component";
import SongCollectionTools from "./song-collection-tools.component";
import SongsTable from "./songs-table.component";
import playlistIcon from "../assets/playlist.png";
import { useState } from "react";
import { Button, Modal } from "flowbite-react";
import CustomTailSpin from "./custom-tail-spin.component";
import { useSelector } from "react-redux";
import { editPlaylistVisibility } from "../utils/api/playlist-api.util";
import { useRevalidator } from "react-router-dom";

const PlaylistViewer = ({ playlist }) => {
	const revalidator = useRevalidator();
	const [openPreShareModal, setOpenPreShareModal] = useState(false);
	const [preShareModalError, setPreShareModalError] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const user = useSelector((state) => state.user.currentUser);

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
			await editPlaylistVisibility(visibility, playlist._id);
			setOpenPreShareModal(false);
			revalidator.revalidate();
		} catch (error) {
			setPreShareModalError(error.message);
		} finally {
			setIsUpdating(false);
		}
	};
	return (
		<div className="flex flex-col gap-5 w-full">
			<SongCollectionTools
				shareTitle={`${playlist.name} playlist by ${playlist.creator.name}`}
				handleShare={handleShare}
			/>
			<HorizontalPlaylistCard
				name={playlist.name}
				creator={playlist.creator.name}
				numOfSongs={playlist.songs.length}
				visibility={
					playlist.visibility.charAt(0).toUpperCase() +
					playlist.visibility.slice(1)
				}
				imgSrc={playlistIcon}
			/>
			<SongsTable songs={playlist.songs} showOverflow />
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
		</div>
	);
};

export default PlaylistViewer;

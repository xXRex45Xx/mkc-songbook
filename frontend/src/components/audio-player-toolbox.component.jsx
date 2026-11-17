/**
 * @fileoverview Audio player toolbox component for additional player controls
 * Provides presentation mode, font size adjustment, and queue management
 */

import { Tooltip, Button, Modal } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { buttonTheme } from "../config/button-theme.config";

import QueueSvg from "../assets/queue.svg?react";
import OptionsSvg from "../assets/v-options.svg?react";
import DownloadAudio from "./download-audio.component.jsx";
import { useEffect, useRef, useState } from "react";
import SongsTable from "./songs-table.component";
import {
	removeSong,
	setCurrentSongIdx,
	setPlaylist,
} from "../store/slices/playlist.slice";

/**
 * Audio Player Toolbox Component
 *
 * Additional controls for the audio player: save offline and queue
 * management. By default it is a desktop-only row of buttons. With
 * `mobileMenu` it renders a phone-only three-dot menu (Queue, Save offline)
 * for the expanded player instead.
 *
 * Features:
 * - Save offline button (desktop) or menu item (mobile)
 * - Queue modal with drag-to-reorder
 * - Mobile three-dot menu closing on outside tap
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.mobileMenu=false] - Render the phone-only menu instead of the desktop row
 * @returns {JSX.Element} Toolbox controls and queue modal
 */
const AudioPlayerToolbox = ({ mobileMenu = false }) => {
	const dispatch = useDispatch();
	const [openQueueModal, setOpenQueueModal] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	// Close the mobile menu when a touch lands outside it.
	useEffect(() => {
		if (!menuOpen) return;
		const onOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target))
				setMenuOpen(false);
		};
		document.addEventListener("pointerdown", onOutside);
		return () => document.removeEventListener("pointerdown", onOutside);
	}, [menuOpen]);
	const queue = useSelector((state) => state.playlist.queue);
	const currentSongIdx = useSelector((state) => state.playlist.currentSongIdx);

	const handleDragEnd = (e) => {
		const { active, over } = e;

		if (!over) return;

		const draggedIdx = active.id;
		const overIdx = over.id;

		if (draggedIdx === overIdx || draggedIdx === overIdx - 1) return;

		let tmp,
			tmpCurrentSongIdx = -1;

		if (overIdx === 0) {
			tmp = [queue[draggedIdx]];
			tmp = tmp.concat(queue.slice(0, draggedIdx));
			if (draggedIdx < queue.length - 1)
				tmp = tmp.concat(queue.slice(draggedIdx + 1));
		} else if (draggedIdx < overIdx - 1) {
			tmp = queue.slice(0, draggedIdx);
			tmp = tmp.concat(queue.slice(draggedIdx + 1, overIdx));
			tmp.push(queue[draggedIdx]);
			if (overIdx < queue.length) {
				tmp = tmp.concat(queue.slice(overIdx));
			}
		} else if (overIdx - 1 < draggedIdx) {
			tmp = queue.slice(0, overIdx);
			tmp.push(queue[draggedIdx]);
			tmp = tmp.concat(queue.slice(overIdx, draggedIdx));
			if (draggedIdx < queue.length - 1)
				tmp = tmp.concat(queue.slice(draggedIdx + 1));
		}

		if (currentSongIdx >= 0) {
			const currentSongId = queue[currentSongIdx]._id;
			const tmpSongIdx = tmp.findIndex((song) => song._id === currentSongId);
			if (tmpSongIdx !== currentSongIdx) tmpCurrentSongIdx = tmpSongIdx;
		}

		dispatch(setPlaylist(tmp));
		if (tmpCurrentSongIdx >= 0)
			dispatch(setCurrentSongIdx(tmpCurrentSongIdx));
	};

	return (
		<>
			{mobileMenu ? (
				<div ref={menuRef} className="relative md:hidden">
					<Button
						className="focus:ring-0"
						theme={buttonTheme}
						size="xxs"
						aria-label="More options"
						aria-expanded={menuOpen}
						onClick={() => setMenuOpen((open) => !open)}
					>
						<OptionsSvg className="w-6 h-6 first:stroke-baseblack last:stroke-baseblack" />
					</Button>
					{menuOpen && (
						<div className="absolute bottom-full right-0 mb-2 flex flex-col gap-4 items-stretch rounded-lg border border-neutrals-200 bg-basewhite p-4 min-w-40">
							<button
								type="button"
								className="flex items-center gap-3 text-sm font-semibold text-baseblack"
								onClick={() => {
									setMenuOpen(false);
									setOpenQueueModal(true);
								}}
							>
								<QueueSvg className="first:stroke-baseblack last:stroke-baseblack" />
								Queue
							</button>
							{queue[currentSongIdx]?.hasAudio && (
								<div className="flex items-center gap-3 text-sm font-semibold text-baseblack">
									<DownloadAudio
										songId={queue[currentSongIdx]._id}
										hasAudio={queue[currentSongIdx].hasAudio}
									/>
									Save offline
								</div>
							)}
						</div>
					)}
				</div>
			) : (
			<div className="hidden md:flex px-5 justify-center items-center gap-7">
				{queue[currentSongIdx]?.hasAudio && (
					<DownloadAudio
						songId={queue[currentSongIdx]._id}
						hasAudio={queue[currentSongIdx].hasAudio}
					/>
				)}
				<Tooltip content="Queue">
					<Button
						className="focus:ring-0"
						theme={buttonTheme}
						positionInGroup="end"
						size="xxs"
						onClick={() => setOpenQueueModal(true)}
					>
						<QueueSvg className="first:stroke-baseblack last:stroke-baseblack hover:first:stroke-neutrals-1000 hover:second:stroke-neutrals-1000 active:first:stroke-neutrals-baseblack active:second:stroke-neutrals-1000" />
					</Button>
				</Tooltip>
			</div>
			)}
			<Modal
				show={openQueueModal}
				size="7xl"
				onClose={() => setOpenQueueModal(false)}
			>
				<Modal.Header>Queue</Modal.Header>
				<Modal.Body>
					<SongsTable
						songs={queue}
						totalPages={0}
						showPlayButton
						onDelete={(songId) => dispatch(removeSong(songId))}
						onDragEnd={handleDragEnd}
						queueTools
					/>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default AudioPlayerToolbox;

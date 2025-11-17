import { Tooltip, Button, Popover, Modal } from "flowbite-react";
import CustomSlider from "./custom-slider.component";
import { useDispatch, useSelector } from "react-redux";
import { setLyricsFontSize } from "../store/slices/configs.slice";
import { buttonTheme } from "../config/button-theme.config";

import TextSizeSvg from "../assets/text-size.svg?react";
import PresentationSvg from "../assets/presentation.svg?react";
import QueueSvg from "../assets/queue.svg?react";
import { useState } from "react";
import SongsTable from "./songs-table.component";
import {
	removeSong,
	setCurrentSongIdx,
	setPlaylist,
} from "../store/slices/playlist.slice";

/**
 * Audio Player Toolbox Component
 *
 * Additional controls and settings for the audio player.
 * Desktop-only component that provides presentation mode,
 * lyrics font size adjustment, and queue management.
 *
 * Features:
 * - Presentation mode toggle with tooltip
 * - Font size adjustment with slider (9-60pts)
 * - Queue management with tooltip
 * - Popover for font size adjustment
 * - Redux integration for font size persistence
 * - Responsive hover and active states
 */
const AudioPlayerToolbox = () => {
	const dispatch = useDispatch();
	const [openQueueModal, setOpenQueueModal] = useState(false);
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
			<div className="hidden md:flex px-5 justify-center items-center gap-7">
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

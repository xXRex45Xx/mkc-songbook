/**
 * @fileoverview Song collection tools component for managing album/playlist actions
 * Provides share, edit, delete, and queue management buttons based on permissions
 */

import BackSvg from "../assets/back.svg?react";
import ShareSvg from "../assets/share.svg?react";
import OptionsSvg from "../assets/v-options.svg?react";
import { Button, Dropdown } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import { useNavigate } from "react-router-dom";
import queueSmallIcon from "../assets/queue-small.svg";
import nextSmallIcon from "../assets/next-small.svg";
import editSmallIcon from "../assets/edit-gray.svg";
import deleteSmallIcon from "../assets/delete.svg";

/**
 * Song Collection Tools Component
 *
 * A toolbar component for managing song collections (albums/playlists).
 * Provides navigation, sharing, and action menu based on permissions.
 * Features:
 * - Back navigation button
 * - Share functionality (conditional)
 * - Options dropdown with edit/delete for admins
 * - Options dropdown with queue/play next for regular users
 * - Role-based action visibility
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.handleShare - Share callback function
 * @param {boolean} props.allowModify - Whether to show edit/delete options
 * @param {boolean} props.allowShare - Whether to show share button
 * @param {Function} props.handleEdit - Edit callback function
 * @param {Function} props.handleDelete - Delete callback function
 * @param {Function} props.handleAddToQueue - Add to queue callback
 * @param {Function} props.handlePlayNext - Play next callback
 * @param {boolean} props.showPlayerTools - Whether to show player-related tools
 */
const SongCollectionTools = ({
	handleShare,
	allowModify,
	allowShare,
	handleEdit,
	handleDelete,
	handleAddToQueue,
	handlePlayNext,
	showPlayerTools,
}) => {
	const navigate = useNavigate();

	return (
		<div className="flex gap-3.5">
			<Button
				className="w-8 border-none focus:ring-0 mr-auto"
				theme={buttonTheme}
				size="xxs"
				onClick={() => navigate(-1)}
			>
				<BackSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
			</Button>
			{allowShare && (
				<Button
					className="w-8 border-none focus:ring-0"
					theme={buttonTheme}
					size="xxs"
					onClick={handleShare}
				>
					<ShareSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				</Button>
			)}
			<Dropdown
				arrowIcon={false}
				inline
				label={
					<OptionsSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				}
			>
				{showPlayerTools && (
					<>
						<Dropdown.Item
							className="flex gap-1.5"
							onClick={handleAddToQueue}
						>
							<img src={queueSmallIcon} alt="" />
							Add To Queue
						</Dropdown.Item>
						<Dropdown.Item
							className="flex gap-1.5"
							onClick={handlePlayNext}
						>
							<img src={nextSmallIcon} alt="" />
							Play Next
						</Dropdown.Item>
					</>
				)}
				{allowModify && (
					<>
						<Dropdown.Item className="flex gap-1.5" onClick={handleEdit}>
							<img src={editSmallIcon} alt="" />
							Edit
						</Dropdown.Item>
						<Dropdown.Divider />
						<Dropdown.Item
							className="flex gap-1.5"
							onClick={handleDelete}
						>
							<img src={deleteSmallIcon} alt="" />
							Delete
						</Dropdown.Item>
					</>
				)}
			</Dropdown>
		</div>
	);
};

export default SongCollectionTools;

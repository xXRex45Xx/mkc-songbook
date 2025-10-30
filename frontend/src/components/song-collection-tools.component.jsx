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

const SongCollectionTools = ({
	handleShare,
	allowModify,
	handleEdit,
	handleDelete,
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
			<Button
				className="w-8 border-none focus:ring-0"
				theme={buttonTheme}
				size="xxs"
				onClick={handleShare}
			>
				<ShareSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
			</Button>
			<Dropdown
				arrowIcon={false}
				inline
				label={
					<OptionsSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
				}
			>
				<Dropdown.Item className="flex gap-1.5">
					<img src={queueSmallIcon} alt="" />
					Add To Queue
				</Dropdown.Item>
				<Dropdown.Item className="flex gap-1.5">
					<img src={nextSmallIcon} alt="" />
					Play Next
				</Dropdown.Item>
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

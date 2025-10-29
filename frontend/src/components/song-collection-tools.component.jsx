import BackSvg from "../assets/back.svg?react";
import ShareSvg from "../assets/share.svg?react";
import OptionsSvg from "../assets/v-options.svg?react";
import { Button } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import { useNavigate } from "react-router-dom";

const SongCollectionTools = ({ handleShare }) => {
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
			<Button
				className="w-8 border-none focus:ring-0"
				theme={buttonTheme}
				size="xxs"
			>
				<OptionsSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
			</Button>
		</div>
	);
};

export default SongCollectionTools;

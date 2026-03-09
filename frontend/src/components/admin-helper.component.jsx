/**
 * @fileoverview Admin helper component for album and song upload actions
 * Provides upload buttons only visible to admin and super-admin users
 */

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { uploadButtonTheme } from "../config/button-theme.config";
import uploadMultipleIcon from "../assets/upload-multiple.svg";
import uploadSingleIcon from "../assets/upload-single.svg";

/**
 * Admin Helper Component
 *
 * Displays album and song upload buttons for admin users.
 * Conditionally renders upload buttons based on user role.
 * Only visible to admin and super-admin users.
 *
 * @component
 * @returns {JSX.Element|null} Upload buttons for admins, empty fragment otherwise
 */
const AdminHelper = () => {
	const navigate = useNavigate();
	const user = useSelector((state) => state.user.currentUser);

	if (["admin", "super-admin"].includes(user?.role))
		return (
			<>
				<Button
					color="failure"
					className="text-nowrap focus:ring-0 h-full"
					theme={uploadButtonTheme}
					size="xs"
					onClick={() => navigate("/albums/new")}
				>
					Upload Album
					<img src={uploadMultipleIcon} alt="" />
				</Button>
				<Button
					className="text-nowrap focus:ring-0 h-full border border-secondary text-secondary"
					theme={uploadButtonTheme}
					size="xs"
					onClick={() => navigate("/songs/new")}
				>
					Upload Song
					<img src={uploadSingleIcon} alt="" />
				</Button>
			</>
		);

	return <></>;
};

export default AdminHelper;

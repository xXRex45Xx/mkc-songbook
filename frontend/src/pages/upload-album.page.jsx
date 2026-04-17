/**
 * @fileoverview Upload album page component
 * Allows admins to upload new albums
 */

import { redirect } from "react-router-dom";
import AlbumForm from "../components/album-form.component";
import MainBodyContainer from "../components/main-body-container.component";
import { addOrEditAlbum } from "../utils/api/album-api.util";
import "./upload-album.styles.css";

/**
 * Upload Album Page Component
 *
 * Displays form for uploading new albums
 * Supports file upload for album cover and metadata
 *
 * @component
 * @returns {JSX.Element} Album upload form
 */
const UploadAlbumPage = () => {
	return (
		<MainBodyContainer title="Upload Album">
			<AlbumForm method="POST" action="/albums/new" />
		</MainBodyContainer>
	);
};

export default UploadAlbumPage;

/**
 * Route action for upload album page
 * Handles album upload submissions
 *
 * @param {Object} params - Action parameters
 * @param {FormData} params.formData - Form submission data
 * @returns {Response|Object} Redirect on success, error object on validation failure
 * @throws {Error} 400: Invalid input, 500: Server error
 */
export const action = async ({ request }) => {
	const formData = await request.formData();

	try {
		const data = await addOrEditAlbum(formData, false);
		if (!data || !data.insertedId)
			throw { status: 500, message: "An unexpected error occurred." };
		return redirect(`/albums/${data.insertedId}`);
	} catch (error) {
		if (error.status === 400) return { ...error, status: null };
		throw error;
	}
};

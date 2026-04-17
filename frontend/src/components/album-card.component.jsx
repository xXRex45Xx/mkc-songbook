/**
 * @fileoverview Album card component for displaying album information with delete functionality
 * Features admin-only edit and delete actions with confirmation modal
 */

import { albumCardTheme } from "../config/card-theme.config";
import { useNavigate, useRevalidator } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import CustomTailSpin from "./custom-tail-spin.component";
import { deleteAlbum } from "../utils/api/album-api.util";
import { Card, Button, Modal } from "flowbite-react";

/**
 * Album Card Component
 *
 * Displays album metadata and navigates to album detail pages.
 * Admin and super-admin users also see edit and delete actions, and deletion is confirmed
 * through a modal before the album is removed and route data is revalidated.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.number - Album number used for navigation and delete requests
 * @param {string} props.title - Album title displayed in the card body
 * @param {string} props.year - Album release year shown in the metadata row
 * @param {number} props.numOfSongs - Total number of songs displayed with the album year
 * @param {string} props.imgSrc - Album cover image source rendered in the card
 * @returns {JSX.Element} Rendered album card with optional admin actions
 * @example
 * ```jsx
 * <AlbumCard
 *   number="12"
 *   title="Worship Collection"
 *   year="2025"
 *   numOfSongs={10}
 *   imgSrc="/images/albums/worship-collection.jpg"
 * />
 * ```
 */
const AlbumCard = ({ number, title, year, numOfSongs, imgSrc }) => {
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const handleDeleteAlbum = async () => {
    setIsDeleting(true);
    try {
      await deleteAlbum(number);
      setOpenDeleteModal(false);
      revalidator.revalidate();
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Card theme={albumCardTheme} className="text-baseblack">
      <div
        className="flex-1 flex flex-col justify-center gap-4 cursor-pointer"
        onClick={() => navigate(`/albums/${number}`)}
      >
        <h2 className="text-lg font-bold">#{number}</h2>
        <img
          src={imgSrc}
          alt="Album cover"
          className="w-40 h-auto self-center"
        />
        <h3 className="text-baseblack text-[16px] font-inter font-semibold leading-[120%]">
          {title}
        </h3>
        <p className="text-neutrals-800 text-[12px] font-inter leading-[120%]">
          {year} - {numOfSongs} songs
        </p>
      </div>

      {["admin", "super-admin"].includes(user?.role) && (
        <div className="flex p-2.5 items-center justify-center mt-4 gap-2.5 self-stretch">
          <Button
            onClick={() => navigate(`/albums/${number}/edit`)}
            className="flex-grow text-xs text-nowrap focus:ring-0 border border-neutrals-400 text-baseblack"
          >
            Edit
          </Button>
          <Button
            onClick={() => setOpenDeleteModal(true)}
            className="flex-grow text-xs text-nowrap focus:ring-0 bg-error-100 text-error-300"
          >
            Delete
          </Button>
          <Modal
            show={openDeleteModal}
            size="sm"
            onClose={() => setOpenDeleteModal(false)}
          >
            <Modal.Header>Delete Album?</Modal.Header>
            <Modal.Body>
              <p className="text-baseblack">This can&apos;t be undone!</p>
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
      )}
    </Card>
  );
};

export default AlbumCard;

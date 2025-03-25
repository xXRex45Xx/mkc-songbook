import { Button, Dropdown, Modal } from "flowbite-react";
import { Form, Link, useNavigation, useRevalidator } from "react-router-dom";
import OptionsSvg from "../assets/options.svg?react";
import HeartSvg from "../assets/heart.svg?react";
import DownloadSvg from "../assets/download.svg?react";
import videoSmallIcon from "../assets/video-small.svg";
import queueSmallIcon from "../assets/queue-small.svg";
import nextSmallIcon from "../assets/next-small.svg";
import shareSmallIcon from "../assets/share-small.svg";
import addSmallIcon from "../assets/add-small.svg";
import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import { useSelector } from "react-redux";
import { useState } from "react";
import CustomTailSpin from "./custom-tail-spin.component";
import { deleteSong } from "../utils/api/songs-api.util";

/**
 * Component for song interaction tools and options
 * Provides different functionality based on user role (admin/regular user)
 * Includes options for song management, playback control, and sharing
 * @param {Object} props - Component props
 * @param {string} props.songId - ID of the song to manage
 * @returns {JSX.Element} Song tools component
 */
const SongTools = ({ songId }) => {
    const revalidator = useRevalidator();
    const windowWidth = useSelector((state) => state.configs.windowWidth);
    const user = useSelector((state) => state.user.currentUser);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const handleDeleteSong = async () => {
        setIsDeleting(true);
        try {
            await deleteSong(songId);
            setOpenDeleteModal(false);
            revalidator.revalidate();
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="flex gap-7 items-center w-fit"
        >
            {windowWidth >= 768 && user?.role !== "admin" && (
                <>
                    <div>
                        <HeartSvg className="first:stroke-baseblack first:fill-basewhite hover:first:fill-primary-400 active:first:fill-primary-700 cursor-pointer" />
                    </div>
                    <div>
                        <DownloadSvg className="hover:first:fill-success-200 active:first:fill-success-300 cursor-pointer" />
                    </div>
                </>
            )}
            {user?.role === "admin" ? (
                <>
                    <Link
                        to={`/songs/${songId}/edit`}
                        className="cursor-pointer"
                    >
                        <img src={editIcon} alt="edit" />
                    </Link>
                    <button
                        className="cursor-pointer"
                        onClick={() => setOpenDeleteModal(true)}
                    >
                        <img src={deleteIcon} alt="delete" />
                    </button>
                    <Modal
                        show={openDeleteModal}
                        size="sm"
                        onClose={() => setOpenDeleteModal(false)}
                    >
                        <Modal.Header>Delete Song?</Modal.Header>
                        <Modal.Body>
                            <p className="text-baseblack">
                                This can't be undone!
                            </p>
                            {deleteError && (
                                <p className="text-secondary mt-2">
                                    {deleteError}
                                </p>
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
                                processingSpinner={
                                    <CustomTailSpin small white />
                                }
                                onClick={handleDeleteSong}
                            >
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            ) : (
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <OptionsSvg className="text-basewhite hover:text-neutrals-400 active:text-baseblack cursor-pointer" />
                    }
                >
                    <Dropdown.Item className="flex gap-1.5">
                        <img src={videoSmallIcon} alt=""></img>Play Video
                    </Dropdown.Item>
                    <Dropdown.Item className="flex gap-1.5">
                        <img src={queueSmallIcon} alt="" />
                        Add To Queue
                    </Dropdown.Item>
                    <Dropdown.Item className="flex gap-1.5">
                        <img src={nextSmallIcon} alt="" />
                        Play Next
                    </Dropdown.Item>
                    <Dropdown.Item className="flex gap-1.5">
                        <img src={shareSmallIcon} alt="" />
                        Share
                    </Dropdown.Item>
                    <Dropdown.Item className="flex gap-1.5">
                        <img src={addSmallIcon} alt="" />
                        New Playlist
                    </Dropdown.Item>
                </Dropdown>
            )}
        </div>
    );
};

export default SongTools;

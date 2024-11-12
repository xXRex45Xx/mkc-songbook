import { Button, Dropdown, Modal } from "flowbite-react";

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

const SongTools = () => {
    const windowWidth = useSelector((state) => state.configs.windowWidth);
    const user = useSelector((state) => state.user.currentUser);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

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
                    <div className="cursor-pointer">
                        <img src={editIcon} alt="edit" />
                    </div>
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

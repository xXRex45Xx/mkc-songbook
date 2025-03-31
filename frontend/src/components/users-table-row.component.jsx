import { Button, Table, Modal } from "flowbite-react";
import promoteIcon from "../assets/promote.svg";
import demoteIcon from "../assets/demote.svg";
import { useState } from "react";
import { useSelector } from "react-redux";

const UsersTableRow = ({ user }) => {
    const [openPromoteModal, setOpenPromoteModal] = useState(false);
    const [openDemoteModal, setOpenDemoteModal] = useState(false);
    const currentUser = useSelector((state) => state.user.currentUser);
    return (
        <Table.Row>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{user.role.replace("-", " ")}</Table.Cell>
            <Table.Cell className="text-end flex justify-end">
                {!["admin", "super-admin"].includes(user.role) && (
                    <>
                        <Button
                            onClick={() => setOpenPromoteModal(true)}
                            className="text-nowrap focus:ring-0 h-full bg-success-100 text-success-300 px-3 hover:brightness-95"
                        >
                            Promote
                            <img
                                className="ml-2"
                                src={promoteIcon}
                                alt="promote"
                            />
                        </Button>
                        <Modal
                            show={openPromoteModal}
                            size="md"
                            onClose={() => setOpenPromoteModal(false)}
                        >
                            <Modal.Header>Promote User</Modal.Header>
                            <Modal.Body>
                                <p className="text-baseblack">
                                    Are you sure you want to promote this user?
                                </p>
                            </Modal.Body>
                            <Modal.Footer className="flex justify-end">
                                <Button
                                    size="sm"
                                    color="light"
                                    className="focus:ring-0"
                                    onClick={() => setOpenPromoteModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="focus:ring-0 bg-success-100 text-success-300 hover:brightness-95"
                                >
                                    Promote
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                )}
                {(currentUser?.role === "super-admin" ||
                    !["admin", "public"].includes(user.role)) &&
                    user.role !== "super-admin" && (
                        <>
                            <Button
                                onClick={() => setOpenDemoteModal(true)}
                                className="text-nowrap focus:ring-0 h-full bg-warning-100 text-warning-300 px-3 hover:brightness-95"
                            >
                                Demote
                                <img
                                    className="ml-2"
                                    src={demoteIcon}
                                    alt="demote"
                                />
                            </Button>
                            <Modal
                                show={openDemoteModal}
                                size="md"
                                onClose={() => setOpenDemoteModal(false)}
                            >
                                <Modal.Header>Demote User</Modal.Header>
                                <Modal.Body>
                                    <p className="text-baseblack">
                                        Are you sure you want to demote this
                                        user?
                                    </p>
                                </Modal.Body>
                                <Modal.Footer className="flex justify-end">
                                    <Button
                                        size="sm"
                                        color="light"
                                        className="focus:ring-0"
                                        onClick={() =>
                                            setOpenDemoteModal(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="focus:ring-0 bg-warning-100 text-warning-300 hover:brightness-95"
                                    >
                                        Demote
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
            </Table.Cell>
        </Table.Row>
    );
};

export default UsersTableRow;

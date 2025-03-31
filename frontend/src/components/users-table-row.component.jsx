import { Button, Table, Modal } from "flowbite-react";
import promoteIcon from "../assets/promote.svg";
import demoteIcon from "../assets/demote.svg";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserRole } from "../utils/api/user-api.util";
import CustomTailSpin from "./custom-tail-spin.component";

const UsersTableRow = ({ user }) => {
    const [openPromoteModal, setOpenPromoteModal] = useState(false);
    const [openDemoteModal, setOpenDemoteModal] = useState(false);
    const currentUser = useSelector((state) => state.user.currentUser);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChangeUserRole = async (id, role) => {
        try {
            setLoading(true);
            setError(null);
            const data = await updateUserRole(id, role);
            if (!data || !data.updated)
                throw new Error("An unexpected error occurred");
            navigate(0);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteUser = async (id, currentRole) => {
        if (currentRole === "public") {
            return await handleChangeUserRole(id, "member", true);
        }
        if (currentRole === "member") {
            await handleChangeUserRole(id, "admin", true);
        }
    };

    const handleDemoteUser = async (id, currentRole) => {
        if (currentRole === "member") {
            return await handleChangeUserRole(id, "public", false);
        }
        if (currentRole === "admin" && currentUser?.role === "super-admin") {
            return await handleChangeUserRole(id, "member", false);
        }
    };

    return (
        <Table.Row>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{user.role.replace("-", " ")}</Table.Cell>
            <Table.Cell className="text-end flex justify-end gap-2">
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
                                {error && (
                                    <p className="text-secondary mt-2">
                                        {error}
                                    </p>
                                )}
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
                                    isProcessing={loading}
                                    processingSpinner={
                                        <CustomTailSpin small white />
                                    }
                                    onClick={handlePromoteUser.bind(
                                        null,
                                        user._id,
                                        user.role
                                    )}
                                >
                                    Promote
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                )}
                {((currentUser?.role === "super-admin" &&
                    !["public", "super-admin"].includes(user.role)) ||
                    !["admin", "super-admin", "public"].includes(
                        user.role
                    )) && (
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
                                    Are you sure you want to demote this user?
                                </p>
                                {error && (
                                    <p className="text-secondary mt-2">
                                        {error}
                                    </p>
                                )}
                            </Modal.Body>
                            <Modal.Footer className="flex justify-end">
                                <Button
                                    size="sm"
                                    color="light"
                                    className="focus:ring-0"
                                    onClick={() => setOpenDemoteModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="focus:ring-0 bg-warning-100 text-warning-300 hover:brightness-95"
                                    isProcessing={loading}
                                    processingSpinner={
                                        <CustomTailSpin small white />
                                    }
                                    onClick={handleDemoteUser.bind(
                                        null,
                                        user._id,
                                        user.role
                                    )}
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

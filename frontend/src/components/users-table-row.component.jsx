import { Button, Table, Modal } from "flowbite-react";
import promoteIcon from "../assets/promote.svg";
import demoteIcon from "../assets/demote.svg";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserRole } from "../utils/api/user-api.util";
import CustomTailSpin from "./custom-tail-spin.component";

/**
 * User Table Row Component
 *
 * A table row for displaying user information with role management actions.
 * Features:
 * - User name, email, and role display
 * - Promote/demote buttons with role-based visibility
 * - Confirmation modals for role changes
 * - Permission-based action availability
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - User object to display
 * @param {string} props.user._id - User identifier
 * @param {string} props.user.name - User name
 * @param {string} props.user.email - User email
 * @param {string} props.user.role - User role
 */
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
                throw new Error("An unexpected error occurred.");
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
            <Table.Cell className="max-md:px-2 max-md:py-3">
                {user.name}
                <span className="md:hidden block text-xs font-normal text-neutrals-800 break-all">
                    {user.email}
                </span>
                <span className="md:hidden block text-xs font-semibold uppercase tracking-wide text-neutrals-800 pt-1">
                    {user.role.replace("-", " ")}
                </span>
            </Table.Cell>
            <Table.Cell className="max-md:hidden">{user.email}</Table.Cell>
            <Table.Cell className="max-md:hidden">
                {user.role.replace("-", " ")}
            </Table.Cell>
            <Table.Cell className="text-end flex justify-end gap-2 max-md:flex-col max-md:items-end max-md:px-2 max-md:py-3">
                {!["admin", "super-admin"].includes(user.role) && (
                    <>
                        <Button
                            onClick={() => setOpenPromoteModal(true)}
                            className="text-nowrap focus:ring-0 h-full bg-success-100 text-success-400 px-3 hover:brightness-95"
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
                                    className="focus:ring-0 bg-success-100 text-success-400 hover:brightness-95"
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
                            className="text-nowrap focus:ring-0 h-full bg-warning-100 text-warning-400 px-3 hover:brightness-95"
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
                                    className="focus:ring-0 bg-warning-100 text-warning-400 hover:brightness-95"
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

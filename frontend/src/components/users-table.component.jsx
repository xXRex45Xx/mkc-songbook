/**
 * @fileoverview Users table component for displaying and managing user accounts
 * Provides paginated table with role management actions via row component
 */

import { useNavigation, useSearchParams } from "react-router-dom";
import CustomTable from "./custom-table.component.jsx";
import CustomTailSpin from "./custom-tail-spin.component.jsx";
import UsersTableRow from "./users-table-row.component.jsx";

/**
 * Users Table Component
 *
 * Displays a paginated table of user accounts with role management.
 * Features:
 * - User name, email, and role display
 * - Pagination support
 * - Loading state during navigation
 * - Integration with user management actions via row component
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.users - Array of user objects to display
 * @param {number} props.totalPages - Total number of pages for pagination
 */
const UsersTable = ({ users, totalPages }) => {
    const { state: navState } = useNavigation();

    const [searchParams, setSearchParams] = useSearchParams();

    const tableHeaders = [
        { align: "left", name: "NAME" },
        { align: "left", name: "EMAIL" },
        { align: "left", name: "ROLE" },
        { align: "right", name: "ACTIONS" },
    ];

    return (
        <>
            {navState === "loading" && <CustomTailSpin />}
            {navState !== "loading" && (
                <CustomTable
                    title="Users"
                    headers={tableHeaders}
                    overflowAuto
                    pagination
                    totalPages={totalPages}
                    onPageChange={(p) => {
                        setSearchParams((prev) => {
                            prev.set("page", p);
                            return prev;
                        });
                    }}
                    currentPage={
                        searchParams.get("page")
                            ? parseInt(searchParams.get("page"))
                            : 1
                    }
                >
                    {users.map((user) => (
                        <UsersTableRow key={user._id} user={user} />
                    ))}
                </CustomTable>
            )}
        </>
    );
};

export default UsersTable;

import { useNavigation, useSearchParams } from "react-router-dom";
import CustomTable from "./custom-table.component.jsx";
import CustomTailSpin from "./custom-tail-spin.component.jsx";
import UsersTableRow from "./users-table-row.component.jsx";

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

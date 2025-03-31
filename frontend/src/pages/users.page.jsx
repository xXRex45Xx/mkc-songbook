import MainBodyContainer from "../components/main-body-container.component.jsx";
import UsersTable from "../components/users-table.component.jsx";
const UsersPage = () => {
    const users = [
        {
            name: "John Doe",
            email: "john.doe@example.com",
            role: "admin",
        },
        {
            name: "Jane Doe",
            email: "jane.doe@example.com",
            role: "user",
        },
    ];
    return (
        <MainBodyContainer>
            <UsersTable users={users} totalPages={1} />
        </MainBodyContainer>
    );
};

export default UsersPage;

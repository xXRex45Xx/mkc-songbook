import MainBodyContainer from "../components/main-body-container.component.jsx";
import UsersTable from "../components/users-table.component.jsx";
import { getAllOrSearchUsers } from "../utils/api/user-api.util.js";
import { Await, useLoaderData, defer } from "react-router-dom";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component.jsx";

const UsersPage = () => {
    const loaderData = useLoaderData();

    return (
        <MainBodyContainer>
            <Suspense fallback={<CustomTailSpin />}>
                <Await resolve={loaderData.userData}>
                    {({ users, totalPages }) => (
                        <UsersTable users={users} totalPages={totalPages} />
                    )}
                </Await>
            </Suspense>
        </MainBodyContainer>
    );
};

export default UsersPage;

export const loader = ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const page = searchParams.get("page");
    const searchQuery = {
        q: searchParams.get("q"),
        type: searchParams.get("type"),
    };
    return defer({
        userData: getAllOrSearchUsers(searchQuery, page ? page : 1),
    });
};

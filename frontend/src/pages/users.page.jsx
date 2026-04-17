/**
 * @fileoverview Users listing page component
 * Displays all users with search and filtering
 */

import MainBodyContainer from "../components/main-body-container.component.jsx";
import UsersTable from "../components/users-table.component.jsx";
import { getAllOrSearchUsers } from "../utils/api/user-api.util.js";
import { Await, useLoaderData, defer } from "react-router-dom";
import { Suspense } from "react";
import CustomTailSpin from "../components/custom-tail-spin.component.jsx";

/**
 * Users Page Component
 *
 * Displays a table of users with search and filtering capabilities
 * Shows user information and management features
 *
 * @component
 * @returns {JSX.Element} Users listing page
 */
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

/**
 * Route loader for users listing page
 * Fetches users with optional search query and type filter
 *
 * @param {Object} params - Route parameters
 * @param {Request} params.request - HTTP request
 * @returns {Promise<{userData: Object}>} Resolves to users and pagination data
 * @throws {Error} 401: Unauthenticated
 */
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

/**
 * @fileoverview Error page component
 * Displays error information and navigation options
 */

import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";

/**
 * Error Page Component
 *
 * Displays error information from React Router
 * Shows appropriate message based on error status code
 * Provides navigation back to home page
 *
 * @component
 * @returns {JSX.Element} Error display component
 */
const ErrorPage = () => {
    const error = useRouteError();
    return (
        <main className="w-full h-full pt-5 gap-5 flex flex-col items-center text-baseblack">
            <h1 className="text-2xl font-bold ">
                {!error.status && "An error occurred"}
                {error.status} {error.status === 400 && "Bad Request"}
                {error.status === 401 && "Unauthorized"}
                {error.status === 404 && "Page Not Found"}
                {error.status === 403 && "Forbidden"}
                {error.status === 500 && "Internal Server Error"}
            </h1>
            <p className="text-sm">
                {error.message === "Failed to fetch"
                    ? "Error loading data. Please check your internet connection or try again later."
                    : error.message}
            </p>
            <Link to="/" className="text-sm text-secondary">
                Go back to the home page
            </Link>
        </main>
    );
};

export default ErrorPage;

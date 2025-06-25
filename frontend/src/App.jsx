/**
 * @fileoverview Root application component
 * Handles layout structure and user authentication state
 */

import { Await, Outlet, defer, useLoaderData } from "react-router-dom";
import "./App.css";
import Header from "./components/header.component";
import AudioPlayer from "./components/audio-player.component";
import store from "./store/store";
import { getCurrentLoggedInUser } from "./utils/api/user-api.util";
import { setCurrentUser } from "./store/slices/user.slice";
import { Suspense } from "react";
import CustomTailSpin from "./components/custom-tail-spin.component";
import { useSelector } from "react-redux";

/**
 * Root application component
 * Manages the main layout including header and audio player
 * Handles authentication state and protected routes
 * @returns {JSX.Element} Root application component
 */
function App() {
    const data = useLoaderData();
    const user = useSelector((state) => state.user.currentUser);

    return (
        <Suspense fallback={<CustomTailSpin />}>
            <Await resolve={data?.user}>
                <Header />
                <Outlet />
                {!["admin", "super-admin"].includes(user?.role) && (
                    <AudioPlayer />
                )}
            </Await>
        </Suspense>
    );
}

export default App;

/**
 * Route loader for the root application
 * Handles user authentication and session management
 * @returns {Promise<Object|null>} Deferred user data or null if not authenticated
 * @throws {Error} If an unexpected error occurs during authentication
 */
export const loader = async () => {
    const token = localStorage.getItem("_s");
    if (!token || store.getState().user.currentUser) return null;
    const getUser = async () => {
        try {
            const data = await getCurrentLoggedInUser(token);
            store.dispatch(setCurrentUser(data.user));
            return null;
        } catch (error) {
            if (error.status === 401) {
                localStorage.removeItem("_s");
                return null;
            }
            throw error;
        }
    };
    return defer({ user: getUser() });
};

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
import { setAdminType, setCurrentUser } from "./store/slices/user.slice";
import { Suspense } from "react";
import CustomTailSpin from "./components/custom-tail-spin.component";
import { useSelector } from "react-redux";
import "./components/audio-player.styles.css";

/**
 * Root application component that manages the main layout structure.
 * Displays the header and audio player conditionally based on user role
 * and queue state. Handles authentication state through route loaders.
 *
 * @example
 * // The App component is rendered as the root element in main.jsx
 * <App />
 * @returns {JSX.Element} Root application component
 */
function App() {
	const data = useLoaderData();
	const user = useSelector((state) => state.user.currentUser);
	const queue = useSelector((state) => state.playlist.queue);
	const hiddenHeader = useSelector((state) => state.configs.hiddenHeader);

	return (
		<Suspense fallback={<CustomTailSpin />}>
			<Await resolve={data?.user}>
				{!hiddenHeader && <Header />}
				<Outlet />
				{!["admin", "super-admin"].includes(user?.role) &&
					queue &&
					queue.length > 0 && <AudioPlayer />}
			</Await>
		</Suspense>
	);
}

export default App;

/**
 * Route loader for the root application that handles user authentication
 * and session management. Checks for valid tokens and dispatches
 * user data to Redux store.
 *
 * @param {Object} _ - Route params object (unused)
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
			if (["admin", "super-admin"].includes(data.user.role)) {
				store.dispatch(setAdminType(data.user.role));
			} else {
				store.dispatch(setAdminType(null));
			}
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

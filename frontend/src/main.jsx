/**
 * @fileoverview Application entry point
 * Sets up React Router, Redux store, and renders the root component
 * Defines all application routes including protected admin routes
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { loader as mainLoader } from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainBodyContainer from "./components/main-body-container.component.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import ProtectedRoute from "./components/protected-route.component.jsx";
import ErrorPage from "./pages/error.page.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Lazily resolves a route module and maps its exports to a route object.
 *
 * @param {() => Promise<Record<string, unknown>>} importer - Dynamic import callback
 * @returns {Promise<import('react-router-dom').LazyRouteFunction<RouteObject>>} Lazy route resolver
 */
const lazyRoute = async (importer) => {
	const mod = await importer();

	return {
		Component: mod.default,
		...(mod.loader ? { loader: mod.loader } : {}),
		...(mod.action ? { action: mod.action } : {}),
	};
};

/**
 * Lazily resolves a protected route module and wraps it with role checking.
 *
 * @param {() => Promise<Record<string, unknown>>} importer - Dynamic import callback
 * @param {string[]} roles - Allowed roles for the route
 * @returns {Promise<import('react-router-dom').LazyRouteFunction<RouteObject>>} Lazy route resolver
 */
const lazyProtectedRoute = async (importer, roles) => {
	const mod = await importer();
	const Component = mod.default;

	return {
		element: (
			<ProtectedRoute roles={roles}>
				<Component />
			</ProtectedRoute>
		),
		...(mod.loader ? { loader: mod.loader } : {}),
		...(mod.action ? { action: mod.action } : {}),
	};
};

/**
 * Lazily resolves an auth child route and optionally wraps it with Google OAuth.
 *
 * @param {() => Promise<Record<string, unknown>>} importer - Dynamic import callback
 * @param {boolean} [withGoogleProvider=false] - Whether to wrap the component in GoogleOAuthProvider
 * @returns {Promise<import('react-router-dom').LazyRouteFunction<RouteObject>>} Lazy route resolver
 */
const lazyAuthRoute = async (importer, withGoogleProvider = false) => {
	const mod = await importer();
	const Component = mod.default;
	const element = withGoogleProvider ? (
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<Component />
		</GoogleOAuthProvider>
	) : (
		<Component />
	);

	return {
		element,
		...(mod.action ? { action: mod.action } : {}),
		...(mod.loader ? { loader: mod.loader } : {}),
	};
};

/**
 * Main application router configuration.
 * Defines all routes including public pages, protected admin routes,
 * and authentication flow. Uses React Router v6 loader/action pattern.
 *
 * @type {import('react-router-dom').RouteObject[]}
 */
const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorPage />,
		loader: mainLoader,
		children: [
			{
				index: true,
				lazy: () => lazyRoute(() => import("./pages/home.page.jsx")),
			},
			{
				path: "songs",
				lazy: () => lazyRoute(() => import("./pages/songs.page.jsx")),
			},
			{
				path: "songs/:songId",
				lazy: () => lazyRoute(() => import("./pages/lyrics.page.jsx")),
			},
			{
				path: "songs/:songId/edit",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/edit-song.page.jsx"),
						["admin", "super-admin"]
					),
			},
			{
				path: "songs/new",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/upload-song.page.jsx"),
						["admin", "super-admin"]
					),
			},
			{
				path: "albums",
				lazy: () => lazyRoute(() => import("./pages/albums.page.jsx")),
			},
			{
				path: "albums/new",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/upload-album.page.jsx"),
						["admin", "super-admin"]
					),
			},
			{
				path: "albums/:albumId",
				lazy: () => lazyRoute(() => import("./pages/album.page.jsx")),
			},
			{
				path: "albums/:albumId/edit",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/edit-album.page.jsx"),
						["admin", "super-admin"]
					),
			},
			{
				path: "playlists",
				lazy: () => lazyRoute(() => import("./pages/playlists.page.jsx")),
			},
			{
				path: "playlists/new",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/new-playlist.page.jsx"),
						["public", "member", "admin", "super-admin"]
					),
			},
			{
				path: "playlists/:playlistId",
				lazy: () => lazyRoute(() => import("./pages/playlist.page.jsx")),
			},
			{
				path: "playlists/:playlistId/edit",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/edit-playlist.page.jsx"),
						["public", "member", "admin", "super-admin"]
					),
			},
			{
				path: "schedule",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/schedule.page.jsx"),
						["member", "admin", "super-admin"]
					),
			},
			{
				path: "schedule/new",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/new-schedule.page.jsx"),
						["admin", "super-admin"]
					),
			},
			{
				path: "users",
				lazy: () =>
					lazyProtectedRoute(
						() => import("./pages/users.page.jsx"),
						["admin", "super-admin"]
					),
			},
			{
				path: "announcements",
				element: (
					<MainBodyContainer
						title={"Under Construction"}
					></MainBodyContainer>
				),
			},
		],
	},
	{
		path: "/auth",
		lazy: () => lazyRoute(() => import("./pages/auth.page.jsx")),
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				lazy: () =>
					lazyAuthRoute(
						() => import("./components/login-form.component.jsx"),
						true
					),
			},
			{
				path: "signup",
				lazy: () =>
					lazyAuthRoute(
						() => import("./components/sign-up-form.component.jsx"),
						true
					),
			},
			{
				path: "verify",
				lazy: () =>
					lazyAuthRoute(
						() => import("./components/verify-email-form.component.jsx")
					),
			},
			{
				path: "create-password",
				lazy: () =>
					lazyAuthRoute(
						() => import("./components/create-password-form.component.jsx")
					),
			},
			{
				path: "forgot-password",
				lazy: () =>
					lazyAuthRoute(
						() => import("./components/forgot-password-form.component.jsx")
					),
			},
			{
				path: "reset-password",
				lazy: () =>
					lazyAuthRoute(
						() => import("./components/reset-password.component.jsx")
					),
			},
		],
	},
]);

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	</StrictMode>
);

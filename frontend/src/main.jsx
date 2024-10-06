import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainBodyContainer from "./components/main-body-container.component.jsx";
import SongsPage from "./pages/songs.page.jsx";
import LyricsPage from "./pages/lyrics.page.jsx";
import AlbumsPage from "./pages/albums.page.jsx";
import { loader as songsLoader } from "./pages/songs.page.jsx";
import { loader as songLoader } from "./pages/lyrics.page.jsx";
import SchedulePage from "./pages/schedule.page.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import Auth from "./pages/auth.page.jsx";
import LoginForm from "./components/login-form.component.jsx";
import SignUpForm from "./components/sign-up-form.component.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: (
                    <MainBodyContainer
                        title={"Recent Media"}
                    ></MainBodyContainer>
                ),
            },
            {
                path: "songs",
                element: <SongsPage />,
                loader: songsLoader,
            },
            {
                path: "songs/:songId",
                element: <LyricsPage />,
                loader: songLoader,
            },
            {
                path: "albums",
                element: <AlbumsPage />,
            },
            {
                path: "playlists",
                element: (
                    <MainBodyContainer title={"Playlists"}></MainBodyContainer>
                ),
            },
            {
                path: "schedule",
                element: <SchedulePage />,
            },
        ],
    },
    {
        path: "/auth",
        element: <Auth />,
        children: [
            {
                index: true,
                element: <LoginForm />,
            },
            {
                path: "signup",
                element: <SignUpForm />,
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

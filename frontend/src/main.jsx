import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainBodyContainer from "./components/main-body-container.component.jsx";
import SongsPage from "./pages/songs.page.jsx";
import LyricsPage from "./pages/lyrics.page.jsx";

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
            },
            {
                path: "songs/:songId",
                element: <LyricsPage />,
            },
            {
                path: "albums",
                element: (
                    <MainBodyContainer title={"Albums"}></MainBodyContainer>
                ),
            },
            {
                path: "playlists",
                element: (
                    <MainBodyContainer title={"Playlists"}></MainBodyContainer>
                ),
            },
            {
                path: "schedule",
                element: (
                    <MainBodyContainer title={"Schedule"}></MainBodyContainer>
                ),
            },
        ],
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);

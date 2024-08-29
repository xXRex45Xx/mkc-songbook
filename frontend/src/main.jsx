import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <h1 className="text-black">HOME</h1>,
            },
            {
                path: "tracks",
                element: <h1 className="text-black">TRACKS</h1>,
            },
            {
                path: "albums",
                element: <h1 className="text-black">ALBUMS</h1>,
            },
            {
                path: "playlists",
                element: <h1 className="text-black">PLAYLISTS</h1>,
            },
            {
                path: "schedule",
                element: <h1 className="text-black">SCHEDULE</h1>,
            },
        ],
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { loader as mainLoader } from "./App.jsx";
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
import Auth, { loader as authLoader } from "./pages/auth.page.jsx";
import LoginForm, {
    action as loginAction,
} from "./components/login-form.component.jsx";
import SignUpForm, {
    action as signUpAction,
} from "./components/sign-up-form.component.jsx";
import VerifyEmailForm, {
    action as verifyEmailAction,
} from "./components/verify-email-form.component.jsx";
import CreatePasswordForm, {
    action as createPasswordAction,
} from "./components/create-password-form.component.jsx";
import ForgotPasswordForm, {
    action as forgotPasswordAction,
} from "./components/forgot-password-form.component.jsx";
import ResetPasswordForm, {
    action as resetPasswordAction,
} from "./components/reset-password.component.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        loader: mainLoader,
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
            {
                path: "users",
                element: (
                    <MainBodyContainer title={"Users"}></MainBodyContainer>
                ),
            },
            {
                path: "announcements",
                element: (
                    <MainBodyContainer
                        title={"Announcements"}
                    ></MainBodyContainer>
                ),
            },
        ],
    },
    {
        path: "/auth",
        element: <Auth />,
        loader: authLoader,
        children: [
            {
                index: true,
                element: <LoginForm />,
                action: loginAction,
            },
            {
                path: "signup",
                element: <SignUpForm />,
                action: signUpAction,
            },
            {
                path: "verify",
                element: <VerifyEmailForm />,
                action: verifyEmailAction,
            },
            {
                path: "create-password",
                element: <CreatePasswordForm />,
                action: createPasswordAction,
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordForm />,
                action: forgotPasswordAction,
            },
            {
                path: "reset-password",
                element: <ResetPasswordForm />,
                action: resetPasswordAction,
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

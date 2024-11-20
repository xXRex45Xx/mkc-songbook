import { Await, Outlet, defer, useLoaderData } from "react-router-dom";
import "./App.css";
import Header from "./components/header.component";
import AudioPlayer from "./components/audio-player.component";
import store from "./store/store";
import { getCurrentLoggedInUser } from "./utils/api/user-api.util";
import { setCurrentUser } from "./store/slices/user.slice";
import { Suspense } from "react";
import Cookies from "js-cookie";
import CustomTailSpin from "./components/custom-tail-spin.component";
import { useSelector } from "react-redux";

function App() {
    const data = useLoaderData();
    const user = useSelector((state) => state.user.currentUser);
    return (
        <Suspense fallback={<CustomTailSpin />}>
            <Await resolve={data?.user}>
                <Header />
                <Outlet />
                {user?.role !== "admin" && <AudioPlayer />}
            </Await>
        </Suspense>
    );
}

export default App;

export const loader = async () => {
    let token = Cookies.get("x-auth-cookie");
    Cookies.remove("x-auth-cookie");
    if (token) localStorage.setItem("_s", token);
    else token = localStorage.getItem("_s");
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

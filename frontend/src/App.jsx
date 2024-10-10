import { Await, Outlet, defer, useLoaderData } from "react-router-dom";
import "./App.css";
import Header from "./components/header.component";
import AudioPlayer from "./components/audio-player.component";
import store from "./store/store";
import { getCurrentLoggedInUser } from "./utils/api/user-api.util";
import { setCurrentUser } from "./store/slices/user.slice";
import { Suspense } from "react";
import { TailSpin } from "react-loader-spinner";

function App() {
    const data = useLoaderData();
    return (
        <Suspense
            fallback={
                <TailSpin
                    visible={true}
                    height="80"
                    width="80"
                    color="#C9184A"
                    ariaLabel="tail-spin-loading"
                    radius="2"
                    wrapperClass="flex-1 self-stretch flex justify-center items-center"
                />
            }
        >
            <Await resolve={data?.user}>
                <Header />
                <Outlet />
                <AudioPlayer />
            </Await>
        </Suspense>
    );
}

export default App;

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
    return null;
};

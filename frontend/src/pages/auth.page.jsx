import { Outlet } from "react-router-dom";
import AuthMainContainer from "../components/auth-main-container.component";

const Auth = () => (
    <div className="w-full h-full flex flex-row">
        <AuthMainContainer>
            <Outlet />
        </AuthMainContainer>
        <aside className="flex-1 flex flex-col justify-center items-stretch gap-16 py-20 px-10 bg-secondary text-basewhite">
            <h1 className="text-5xl font-bold">
                Your Source for MKC Choir's Gospel Songs
            </h1>
            <p className="text-2xl">
                Stream your favorite songs anytime, anywhere. Join our community
                of listeners and let every note inspire your soul.
            </p>
        </aside>
    </div>
);

export default Auth;

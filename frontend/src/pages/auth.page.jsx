import { Outlet } from "react-router-dom";
import AuthMainContainer from "../components/auth-main-container.component";

const Auth = () => (
    <div className="flex h-full w-full min-w-[22.5rem] flex-col items-stretch md:flex-row">
        <AuthMainContainer>
            <Outlet />
        </AuthMainContainer>
        <aside className="flex-1 flex flex-col items-stretch gap-7 py-10 px-5 md:justify-center md:gap-16 md:py-10 md:px-5 lg:py-20 lg:px-10 bg-secondary text-basewhite">
            <h1 className="text-3xl md:text-5xl font-bold">
                Your Source for MKC Choir's Gospel Songs
            </h1>
            <p className="text-base md:text-2xl">
                Stream your favorite songs anytime, anywhere. Join our community
                of listeners and let every note inspire your soul.
            </p>
        </aside>
    </div>
);

export default Auth;

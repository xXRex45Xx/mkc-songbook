/**
 * @fileoverview Authentication page layout
 * Wraps login/register forms with branding and promotional content
 */

import { Outlet, redirect } from "react-router-dom";
import AuthMainContainer from "../components/auth-main-container.component";
import { isSignedIn } from "../utils/session.util";

/**
 * Auth Page Component
 *
 * Main authentication layout wrapping login/register sub-routes
 * Displays marketing content for non-authenticated users
 * Redirects to home if already logged in
 *
 * @component
 * @returns {JSX.Element} Auth layout with outlet for child routes
 */
const Auth = () => (
    <div className="flex h-full w-full min-w-80 flex-col items-stretch md:flex-row">
        <AuthMainContainer>
            <Outlet />
        </AuthMainContainer>
        <aside className="flex flex-col items-stretch gap-3 py-6 px-5 md:flex-1 md:justify-center md:gap-16 md:py-10 md:px-5 lg:py-20 lg:px-10 bg-secondary text-basewhite">
            <h1 className="text-xl md:text-5xl font-bold">
                Your Source for MKC Choir&apos;s Gospel Songs
            </h1>
            <p className="max-md:hidden text-base md:text-2xl">
                Stream your favorite songs anytime, anywhere. Join our community
                of listeners and let every note inspire your soul.
            </p>
        </aside>
    </div>
);

export default Auth;

/**
 * Auth page loader
 * Redirects to home if user is already authenticated
 *
 * @returns {null|Response} null for authenticated users, redirect for logged-in users
 */
export const loader = () => {
    if (isSignedIn()) return redirect("/");
    return null;
};

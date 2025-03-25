import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { buttonTheme } from "../config/button-theme.config";
import BackSvg from "../assets/back.svg?react";

/**
 * Authentication Main Container Component
 *
 * Layout container for authentication-related pages.
 * Provides consistent styling and navigation for auth flows.
 *
 * Features:
 * - Responsive layout with different styles for mobile/desktop
 * - Back navigation for email verification page
 * - Logo and brand display for other auth pages
 * - Consistent padding and spacing
 * - Flexible content area for auth forms
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Auth form or content to render
 */
const AuthMainContainer = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <main className="flex-1 flex flex-col gap-7 py-10 px-5 bg-basewhite md:flex-initial md:self-stretch md:w-[26.25rem] md:px-8 lg:p-10 md:gap-16">
            <div className="flex items-center gap-3">
                {location.pathname === "/auth/verify" ? (
                    <>
                        <Button
                            className="w-8 border-none focus:ring-0"
                            theme={buttonTheme}
                            size="xxs"
                            onClick={() => navigate(-1)}
                        >
                            <BackSvg className="stroke-neutrals-700 hover:stroke-neutrals-500 active:stroke-neutrals-600" />
                        </Button>
                        <span className="font-semibold text-neutrals-800">
                            Go Back
                        </span>
                    </>
                ) : (
                    <>
                        <img
                            src="/logo.svg"
                            className="mr-3 h-8 rounded-md shadow-xl"
                        />
                        <span className="text-2xl font-semibold text-baseblack">
                            MKC Choir
                        </span>
                    </>
                )}
            </div>
            {children}
        </main>
    );
};

export default AuthMainContainer;

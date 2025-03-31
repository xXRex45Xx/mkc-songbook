import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { navbarTheme } from "../config/navbar-theme.config";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import Bell from "../assets/active-bell.svg?react";
import heart from "../assets/heart.svg";
import SearchBar from "./search-bar.component";
import SearchToggleSvg from "../assets/search-toggle.svg?react";
import { useMemo, useState } from "react";
import { buttonTheme } from "../config/button-theme.config";
import { useDispatch, useSelector } from "react-redux";
import { resetCurrentUser } from "../store/slices/user.slice";

/**
 * Header Component
 *
 * Main navigation component that appears at the top of every page.
 * Includes:
 * - Logo and brand name
 * - Search toggle button
 * - Notifications dropdown (currently empty)
 * - User profile dropdown with authentication options
 * - Navigation links with role-based access control
 * - Collapsible search bar
 *
 * @component
 * @example
 * return (
 *   <Header />
 * )
 */
const Header = () => {
    const { pathname } = useLocation();
    const [searchParams, _setSearchParams] = useSearchParams();

    /**
     * Controls visibility of the search bar.
     * Initialized based on presence of search query parameters.
     */
    const [showSearch, setShowSearch] = useState(
        searchParams.has("q") || searchParams.has("type")
    );
    const dispatch = useDispatch();

    /**
     * Toggles the visibility of the search bar
     */
    const toggleSearch = () => setShowSearch((prev) => !prev);

    /**
     * Current user information from Redux store
     */
    const user = useSelector((state) => state.user.currentUser);

    /**
     * Memoized user role for conditional rendering
     * Defaults to "public" if no user or user has public role
     */
    const role = useMemo(() => {
        if (!user || user.role === "public") return "public";
        return user.role;
    }, [user]);

    const searchPath = useMemo(() => {
        if (pathname.startsWith("/users")) return "/users";
        return "/songs";
    }, [pathname]);

    /**
     * Handles user logout by clearing Redux store and local storage
     */
    const handleLogout = () => {
        dispatch(resetCurrentUser());
        localStorage.removeItem("_s");
    };
    return (
        <>
            <Navbar fluid theme={navbarTheme} border>
                <Navbar.Brand>
                    <img
                        src="/logo.svg"
                        className="mr-3 h-8 rounded-md shadow-xl"
                        alt="Flowbite React Logo"
                    />
                    <span className="self-center font-semibold whitespace-nowrap text-2xl text-baseblack">
                        MKC Choir
                    </span>
                </Navbar.Brand>
                <div className="pb-6 flex gap-5">
                    <Button
                        onClick={toggleSearch}
                        className="focus:ring-0 *:p-0"
                        theme={buttonTheme}
                    >
                        <SearchToggleSvg
                            className={
                                showSearch
                                    ? "*:stroke-secondary-600"
                                    : "*:stroke-baseblack"
                            }
                        />
                    </Button>
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={<Bell className="text-transparent" />}
                        theme={{
                            inlineWrapper: "hidden md:flex md:items-center",
                        }}
                    >
                        <Dropdown.Header>
                            <span className="block text-sm">Notifications</span>
                        </Dropdown.Header>
                    </Dropdown>
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt="User settings"
                                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                rounded
                            />
                        }
                    >
                        {user ? (
                            <>
                                <Dropdown.Header>
                                    <span className="block text-sm">
                                        {user.name}
                                    </span>
                                    <span className="block truncate text-sm font-medium">
                                        {user.email}
                                    </span>
                                </Dropdown.Header>
                                <Dropdown.Item>My Profile</Dropdown.Item>
                                <Dropdown.Item>Account Settings</Dropdown.Item>
                                <Dropdown.Item>
                                    <img src={heart} alt="" />
                                    My Favorites
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>
                                    Log Out
                                </Dropdown.Item>
                            </>
                        ) : (
                            <>
                                <Dropdown.Item>
                                    <Link
                                        to="/auth/signup"
                                        className="w-full text-start"
                                    >
                                        Create Account
                                    </Link>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Link
                                        to="auth"
                                        className="w-full text-start"
                                    >
                                        Login
                                    </Link>
                                </Dropdown.Item>
                            </>
                        )}
                    </Dropdown>
                </div>
            </Navbar>
            <Navbar fluid border theme={navbarTheme}>
                <Navbar.Collapse>
                    {role !== "admin" && (
                        <Navbar.Link as={Link} to="/" active={pathname === "/"}>
                            Home
                        </Navbar.Link>
                    )}
                    <Navbar.Link
                        as={Link}
                        to="/songs"
                        active={pathname.startsWith("/songs")}
                    >
                        Songs
                    </Navbar.Link>
                    <Navbar.Link
                        as={Link}
                        to="/albums"
                        active={pathname.startsWith("/albums")}
                    >
                        Albums
                    </Navbar.Link>
                    {role !== "admin" && (
                        <Navbar.Link
                            as={Link}
                            to="/playlists"
                            active={pathname.startsWith("/playlists")}
                        >
                            Playlists
                        </Navbar.Link>
                    )}
                    {role !== "public" && (
                        <Navbar.Link
                            as={Link}
                            to="/schedule"
                            active={pathname.startsWith("/schedule")}
                        >
                            Schedule
                        </Navbar.Link>
                    )}
                    {role === "admin" && (
                        <Navbar.Link
                            as={Link}
                            to="/users"
                            active={pathname.startsWith("/users")}
                        >
                            Users
                        </Navbar.Link>
                    )}
                    {role === "admin" && (
                        <Navbar.Link
                            as={Link}
                            to="/announcements"
                            active={pathname.startsWith("/announcements")}
                        >
                            Announcements
                        </Navbar.Link>
                    )}
                </Navbar.Collapse>
            </Navbar>
            <div
                className={` transition-all flex justify-center ${
                    showSearch
                        ? "max-h-40 pt-7"
                        : "max-h-0 overflow-hidden pt-0"
                } `}
            >
                <SearchBar
                    action={searchPath}
                    searchValue={searchParams.get("q")}
                    selectValue={searchParams.get("type")}
                />
            </div>
        </>
    );
};

export default Header;

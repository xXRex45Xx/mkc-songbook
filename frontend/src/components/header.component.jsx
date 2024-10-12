import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { navbarTheme } from "../config/navbar-theme.config";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import Bell from "../assets/active-bell.svg?react";
import heart from "../assets/heart.svg";
import SearchBar from "./search-bar.component";
import SearchToggleSvg from "../assets/search-toggle.svg?react";
import { useState } from "react";
import { buttonTheme } from "../config/button-theme.config";
import { useDispatch, useSelector } from "react-redux";
import { resetCurrentUser } from "../store/slices/user.slice";

const Header = () => {
    const { pathname } = useLocation();
    const [searchParams, _setSearchParams] = useSearchParams();
    const [showSearch, setShowSearch] = useState(
        searchParams.has("q") || searchParams.has("type")
    );
    const dispatch = useDispatch();

    const toggleSearch = () => setShowSearch((prev) => !prev);

    const user = useSelector((state) => state.user.currentUser);

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
                    <Navbar.Link as={Link} to="/" active={pathname === "/"}>
                        Home
                    </Navbar.Link>
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
                    <Navbar.Link
                        as={Link}
                        to="/playlists"
                        active={pathname.startsWith("/playlists")}
                    >
                        Playlists
                    </Navbar.Link>
                    <Navbar.Link
                        as={Link}
                        to="/schedule"
                        active={pathname.startsWith("/schedule")}
                    >
                        Schedule
                    </Navbar.Link>
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
                    action="/songs"
                    searchValue={searchParams.get("q")}
                    selectValue={searchParams.get("type")}
                />
            </div>
        </>
    );
};

export default Header;

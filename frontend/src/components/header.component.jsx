import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { navbarTheme } from "../config/navbar-theme.config";
import { useLocation, useSearchParams } from "react-router-dom";

import Bell from "../assets/active-bell.svg?react";
import heart from "../assets/heart.svg";
import SearchBar from "./search-bar.component";
import SearchToggleSvg from "../assets/search-toggle.svg?react";
import { useState } from "react";
import { buttonTheme } from "../config/button-theme.config";

const Header = () => {
    const { pathname } = useLocation();
    const [searchParams, _setSearchParams] = useSearchParams();
    const [showSearch, setShowSearch] = useState(
        searchParams.has("q") || searchParams.has("type")
    );

    const toggleSearch = () => setShowSearch((prev) => !prev);

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
                        <Dropdown.Header>
                            <span className="block text-sm">
                                Eteye Askalech
                            </span>
                            <span className="block truncate text-sm font-medium">
                                askalech@my.email.com
                            </span>
                        </Dropdown.Header>
                        <Dropdown.Item>My Profile</Dropdown.Item>
                        <Dropdown.Item>Account Settings</Dropdown.Item>
                        <Dropdown.Item>
                            <img src={heart} alt="" />
                            My Favorites
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>Log Out</Dropdown.Item>
                    </Dropdown>
                </div>
            </Navbar>
            <Navbar fluid border theme={navbarTheme}>
                <Navbar.Collapse>
                    <Navbar.Link href="/" active={pathname === "/"}>
                        Home
                    </Navbar.Link>
                    <Navbar.Link
                        href="/songs"
                        active={pathname.startsWith("/songs")}
                    >
                        Songs
                    </Navbar.Link>
                    <Navbar.Link
                        href="/albums"
                        active={pathname.startsWith("/albums")}
                    >
                        Albums
                    </Navbar.Link>
                    <Navbar.Link
                        href="/playlists"
                        active={pathname.startsWith("/playlists")}
                    >
                        Playlists
                    </Navbar.Link>
                    <Navbar.Link
                        href="/schedule"
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

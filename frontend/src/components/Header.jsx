import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { navbarTheme } from "../config/theme.config";
import inactiveBell from "../assets/inactive-bell.svg";

const Header = () => (
    <>
        <Navbar fluid theme={navbarTheme} border>
            <Navbar.Brand>
                <img
                    src="/logo.svg"
                    className="mr-3 h-8 rounded-md"
                    alt="Flowbite React Logo"
                />
                <span className="self-center font-semibold whitespace-nowrap text-2xl text-baseblack">
                    MKC Choir
                </span>
            </Navbar.Brand>
            <div className="pb-6 flex gap-5">
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={<img alt="Notifications" src={inactiveBell} />}
                >
                    <Dropdown.Header>
                        <span className="block text-sm">Bonnie Green</span>
                        <span className="block truncate text-sm font-medium">
                            name@flowbite.com
                        </span>
                    </Dropdown.Header>
                    <Dropdown.Item>Dashboard</Dropdown.Item>
                    <Dropdown.Item>Settings</Dropdown.Item>
                    <Dropdown.Item>Earnings</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>Sign out</Dropdown.Item>
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
                        <span className="block text-sm">Bonnie Green</span>
                        <span className="block truncate text-sm font-medium">
                            name@flowbite.com
                        </span>
                    </Dropdown.Header>
                    <Dropdown.Item>Dashboard</Dropdown.Item>
                    <Dropdown.Item>Settings</Dropdown.Item>
                    <Dropdown.Item>Earnings</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>Sign out</Dropdown.Item>
                </Dropdown>
                <Navbar.Toggle />
            </div>
        </Navbar>
        <Navbar fluid border theme={navbarTheme}>
            <Navbar.Collapse>
                <Navbar.Link href="#" active>
                    Home
                </Navbar.Link>
                <Navbar.Link href="#">Tracks</Navbar.Link>
                <Navbar.Link href="#">Albums</Navbar.Link>
                <Navbar.Link href="#">Playlists</Navbar.Link>
                <Navbar.Link href="#">Schedule</Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    </>
);

export default Header;

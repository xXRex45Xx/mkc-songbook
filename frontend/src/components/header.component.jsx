/**
 * @fileoverview Header component for main navigation
 * Provides logo, search bar, notifications, user profile dropdown, and navigation links
 */

import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { navbarTheme } from "../config/navbar-theme.config";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import Bell from "../assets/active-bell.svg?react";
import heart from "../assets/heart.svg";
import SearchBar from "./search-bar.component";
import SearchToggleSvg from "../assets/search-toggle.svg?react";
import MenuSvg from "../assets/menu.svg?react";
import InstallPrompt from "./install-prompt.component";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { buttonTheme } from "../config/button-theme.config";
import { useDispatch, useSelector } from "react-redux";
import {
	resetCurrentUser,
	setAdminType,
	toggleRole,
} from "../store/slices/user.slice";
import { userIdbService } from "../utils/db/user-idb-service.util";

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
	const isAdmin = useSelector((state) => state.user.adminType) ? true : false;

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
		if (pathname.startsWith("/albums")) return "/albums";
		return "/songs";
	}, [pathname]);

	/**
	 * Navigation links visible to the current role
	 */
	const navLinks = useMemo(() => {
		const links = [
			{ to: "/songs", label: "Songs" },
			{ to: "/albums", label: "Albums" },
			{ to: "/playlists", label: "Playlists" },
		];
		if (role !== "public") links.push({ to: "/schedule", label: "Schedule" });
		if (["admin", "super-admin"].includes(user?.role))
			links.push({ to: "/users", label: "Users" });
		if (["admin", "super-admin", "member"].includes(user?.role))
			links.push({ to: "/announcements", label: "Announcements" });
		return links;
	}, [role, user]);

	/**
	 * Whether the links no longer fit in one row on a narrow screen. When they
	 * do not, the row collapses into the current page name plus a menu button.
	 */
	const [navOverflows, setNavOverflows] = useState(false);
	const navRowRef = useRef(null);
	const navMeasureRef = useRef(null);

	useLayoutEffect(() => {
		const row = navRowRef.current;
		const measure = navMeasureRef.current;
		if (!row || !measure) return;
		const check = () => setNavOverflows(measure.offsetWidth > row.clientWidth);
		check();
		const observer = new ResizeObserver(check);
		observer.observe(row);
		return () => observer.disconnect();
	}, [navLinks]);

	const activeLink =
		navLinks.find((link) => pathname.startsWith(link.to)) || navLinks[0];

	/**
	 * Handles user logout by clearing Redux store, the offline user cache,
	 * and local storage
	 *
	 * @returns {Promise<void>}
	 */
	const handleLogout = async () => {
		dispatch(resetCurrentUser());
		dispatch(setAdminType(null));
		localStorage.removeItem("_s");
		try {
			await userIdbService.clear();
		} catch (error) {
			console.error("Failed to clear the cached user:", error);
		}
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
					<InstallPrompt />
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
									<span className="block text-sm">{user.name}</span>
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
								{isAdmin && (
									<>
										<Dropdown.Item
											onClick={() => dispatch(toggleRole())}
										>
											{["admin", "super-admin"].includes(user?.role)
												? "Member Mode"
												: "Admin Mode"}
										</Dropdown.Item>
										<Dropdown.Divider />
									</>
								)}
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
									<Link to="auth" className="w-full text-start">
										Login
									</Link>
								</Dropdown.Item>
							</>
						)}
					</Dropdown>
				</div>
			</Navbar>
			<Navbar fluid border theme={navbarTheme}>
				<div ref={navRowRef} className="w-full h-0 overflow-hidden md:hidden">
					<ul
						ref={navMeasureRef}
						aria-hidden="true"
						className="invisible flex w-max gap-6 text-sm font-semibold whitespace-nowrap"
					>
						{navLinks.map((link) => (
							<li key={link.to}>{link.label}</li>
						))}
					</ul>
				</div>
				{navOverflows && (
					<div className="flex w-full items-center justify-between pb-2 md:hidden">
						<span className="block pb-2 font-semibold text-sm text-secondary border-b-2 border-b-secondary">
							{activeLink.label}
						</span>
						<Dropdown
							arrowIcon={false}
							inline
							label={
								<span className="p-2">
									<span className="sr-only">Open navigation menu</span>
									<MenuSvg className="*:stroke-baseblack hover:*:stroke-secondary-600 active:*:stroke-secondary-700" />
								</span>
							}
						>
							{navLinks.map((link) => (
								<Dropdown.Item
									key={link.to}
									as={Link}
									to={link.to}
									className={
										pathname.startsWith(link.to)
											? "font-semibold text-secondary"
											: ""
									}
								>
									{link.label}
								</Dropdown.Item>
							))}
						</Dropdown>
					</div>
				)}
				<Navbar.Collapse className={navOverflows ? "max-md:hidden" : ""}>
					{navLinks.map((link) => (
						<Navbar.Link
							key={link.to}
							as={Link}
							to={link.to}
							active={pathname.startsWith(link.to)}
						>
							{link.label}
						</Navbar.Link>
					))}
				</Navbar.Collapse>
			</Navbar>
			<div
				className={` transition-all flex justify-center px-5 md:px-0 ${
					showSearch ? "max-h-40 pt-7" : "max-h-0 overflow-hidden pt-0"
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

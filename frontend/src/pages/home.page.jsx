/**
 * @fileoverview Home page component
 * Redirects users to the songs page
 */

import { useNavigate } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { useSelector } from "react-redux";
import { useEffect } from "react";

/**
 * Home Page Component
 *
 * Redirects users to the songs page on mount
 * Currently displays a placeholder "Under Construction" message
 *
 * @component
 * @returns {JSX.Element} Placeholder home page
 */
const HomePage = () => {
	const navigate = useNavigate();
	useEffect(() => {
		navigate("/songs");
	}, []);
	return <MainBodyContainer title={"Under Construction"}></MainBodyContainer>;
};

export default HomePage;

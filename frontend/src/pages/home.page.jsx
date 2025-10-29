import { useNavigate } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const HomePage = () => {
	const navigate = useNavigate();
	useEffect(() => {
		navigate("/songs");
	}, []);
	return <MainBodyContainer title={"Under Construction"}></MainBodyContainer>;
};

export default HomePage;

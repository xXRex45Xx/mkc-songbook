import { useNavigate } from "react-router-dom";
import MainBodyContainer from "../components/main-body-container.component";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const HomePage = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.currentUser);
    useEffect(() => {
        if (user?.role === "admin") navigate("/songs");
    }, [user]);
    return <MainBodyContainer title={"Recent Media"}></MainBodyContainer>;
};

export default HomePage;

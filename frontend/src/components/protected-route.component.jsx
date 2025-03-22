import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.currentUser);

    useEffect(() => {
        if (!user) navigate("/auth");
        if (!roles.includes(user?.role))
            throw {
                status: 403,
                message: "You are not authorized to access this page.",
            };
    }, [user]);
    return children;
};

export default ProtectedRoute;

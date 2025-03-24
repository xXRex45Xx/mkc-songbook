import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
    const navigate = useNavigate();
    const locaiton = useLocation();
    const user = useSelector((state) => state.user.currentUser);

    useEffect(() => {
        if (!user) return navigate(`/auth?redirect=${locaiton.pathname}`);
        if (!roles.includes(user?.role))
            throw {
                status: 403,
                message: "You are not authorized to access this page.",
            };
    }, [user]);
    return children;
};

export default ProtectedRoute;

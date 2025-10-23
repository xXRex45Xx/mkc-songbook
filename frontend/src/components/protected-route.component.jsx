import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Protected Route Component
 *
 * Higher-order component that protects routes based on user authentication and role.
 * Redirects to login if user is not authenticated.
 * Throws a 403 error if user's role is not authorized.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array<string>} props.roles - List of roles allowed to access the route
 *
 * @throws {Error} 403 error if user's role is not in the allowed roles list
 */
const ProtectedRoute = ({ children, roles }) => {
	const navigate = useNavigate();
	const locaiton = useLocation();
	const user = useSelector((state) => state.user.currentUser);

	/**
	 * Effect to check user authentication and authorization
	 * Redirects to login page if user is not authenticated
	 * Throws error if user's role is not authorized
	 */
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

import { ForbiddenError, UnauthorizedError } from "../utils/error.util.js";

const roleBasedAuthorization = (roles) => {
    return async (req, _res, next) => {
        if (!req.isAuthenticated())
            throw new UnauthorizedError(
                "You must be logged in to access this resource."
            );
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError(
                "You are not authorized to access this resource."
            );
        }
        next();
    };
};

export default roleBasedAuthorization;

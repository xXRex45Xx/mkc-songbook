import passport from "passport";
import { ClientFaultError, ServerFaultError } from "../utils/error.util.js";
import jwt from "jsonwebtoken";

const localAuth = async (req, res, next) => {
    passport.authenticate("local", {}, (err, user) => {
        if (err) return next(new ServerFaultError(err));
        if (!user)
            return next(new ClientFaultError("Invalid username or password."));
        req.login(user, { session: false }, (err) => {
            if (err) return next(new ServerFaultError(err));
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "30 days" }
            );
            return res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        });
    })(req, res, next);
};

export default localAuth;

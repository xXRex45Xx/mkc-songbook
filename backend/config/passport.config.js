import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: false,
        },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({ email: email.trim() });
                const message = "Incorrect Username or Password.";

                if (!user) return done(null, false, { message });
                const matches = await bcrypt.compare(password, user.password);

                if (!matches) return done(null, false, { message });
                const token = jwt.sign(
                    {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                    },
                    process.env.JWT_SECRET
                );
                return done(null, { user, token });
            } catch (error) {
                return done(error);
            }
        }
    )
);

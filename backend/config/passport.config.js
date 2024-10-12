import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
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

                if (!user) return done(null, false);
                const matches = await bcrypt.compare(password, user.password);

                if (!matches) return done(null, false);

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await UserModel.findById(payload.id, {
                    email: true,
                    name: true,
                    role: true,
                });
                if (!user) return done(null, false);
                done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await UserModel.findOne({
                email: profile.emails[0].value,
            });
            if (user) return done(null, user);
            user = await UserModel.create({
                email: profile.emails[0].value,
                name: profile.displayName,
                photo: profile.photos[0].value,
            });
            done(null, user);
        }
    )
);

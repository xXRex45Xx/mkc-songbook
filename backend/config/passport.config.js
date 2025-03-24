/**
 * Passport.js Configuration
 *
 * This module configures authentication strategies for the application using Passport.js.
 * It sets up three authentication strategies:
 * 1. Local Strategy - For email/password authentication
 * 2. JWT Strategy - For token-based authentication
 * 3. Google OAuth Strategy - For Google sign-in
 *
 * @module passport.config
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Local Strategy Configuration
 *
 * Handles email/password authentication by:
 * 1. Finding the user by email
 * 2. Verifying the password using bcrypt
 * 3. Returning the user object if credentials are valid
 */
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

                if (!user || !user.password) return done(null, false);
                const matches = await bcrypt.compare(password, user.password);

                if (!matches) return done(null, false);

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

/**
 * JWT Strategy Configuration
 *
 * Handles token-based authentication by:
 * 1. Extracting JWT from Authorization header
 * 2. Verifying the token using JWT_SECRET
 * 3. Finding the user by ID from token payload
 * 4. Returning the user object if token is valid
 */
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

import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import validateOtp from "../middlewares/validate-otp.middleware.js";
import {
    OAuthCreateToken,
    getCurrentUser,
    registerOTP,
    registerUser,
    resetPassword,
    verifyOTP,
} from "../controllers/userController.js";
import localAuth from "../middlewares/local-auth.middleware.js";
import {
    validateLogin,
    validateRegisterOTP,
    validateRegisterUser,
    validateResetPassword,
    validateVerifyOTP,
} from "../middlewares/user-validation.middleware.js";
import checkUserExists from "../middlewares/check-user-exists.middleware.js";
import passport from "passport";

const userRouter = Router();

userRouter.post(
    "/",
    wrapAsync(validateRegisterUser),
    wrapAsync(validateOtp),
    wrapAsync(registerUser)
);
userRouter.post(
    "/otp",
    wrapAsync(validateRegisterOTP),
    wrapAsync(checkUserExists),
    wrapAsync(registerOTP)
);
userRouter.post(
    "/verify-otp",
    wrapAsync(validateVerifyOTP),
    wrapAsync(verifyOTP)
);
userRouter.post("/login", wrapAsync(validateLogin), wrapAsync(localAuth));
userRouter.get(
    "/current-user",
    passport.authenticate("jwt", { session: false }),
    wrapAsync(getCurrentUser)
);
userRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    wrapAsync(OAuthCreateToken)
);

userRouter.put(
    "/reset-password",
    wrapAsync(validateResetPassword),
    wrapAsync(validateOtp),
    wrapAsync(resetPassword)
);
export default userRouter;

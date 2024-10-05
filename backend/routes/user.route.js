import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import validateOtp from "../middlewares/validate-otp.middleware.js";
import { registerOTP, registerUser } from "../controllers/userController.js";
import localAuth from "../middlewares/local-auth.middleware.js";
import {
    validateLogin,
    validateRegisterOTP,
    validateRegisterUser,
} from "../middlewares/user-validation.middleware.js";

const userRouter = Router();

userRouter.post(
    "/",
    wrapAsync(validateRegisterUser),
    wrapAsync(validateOtp),
    wrapAsync(registerUser)
);
userRouter.post("/otp", wrapAsync(validateRegisterOTP), wrapAsync(registerOTP));
userRouter.post("/login", wrapAsync(validateLogin), wrapAsync(localAuth));

export default userRouter;

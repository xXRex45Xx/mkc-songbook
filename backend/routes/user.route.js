import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import validateOtp from "../middlewares/validate-otp.middleware.js";
import { registerOTP, registerUser } from "../controllers/userController.js";
import localAuth from "../middlewares/local-auth.middleware.js";

const userRouter = Router();

userRouter.route("/").post(wrapAsync(validateOtp), wrapAsync(registerUser));
userRouter.post("/otp", wrapAsync(registerOTP));
userRouter.post("/login", wrapAsync(localAuth));

export default userRouter;

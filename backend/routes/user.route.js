import { Router } from "express";
import { wrapAsync } from "../utils/error.util.js";
import validateOtp from "../middlewares/validate-otp.middleware.js";
import { registerOTP, registerUser } from "../controllers/userController.js";

const userRouter = Router();

userRouter.route("/").post(wrapAsync(validateOtp), wrapAsync(registerUser));
userRouter.route("/otp").post(wrapAsync(registerOTP));

export default userRouter;

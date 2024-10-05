import OTPModel from "../models/otp.model.js";
import { ClientFaultError } from "../utils/error.util.js";

const validateOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    const storedOTP = await OTPModel.findOne({ email });
    if (!storedOTP || storedOTP.otp !== parseInt(otp))
        throw new ClientFaultError("Verification code is invalid.");
    next();
};

export default validateOtp;

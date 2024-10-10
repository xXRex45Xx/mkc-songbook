import OTPModel from "../models/otp.model.js";
import generateOtp from "../utils/otp.util.js";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ClientFaultError } from "../utils/error.util.js";

export const registerOTP = async (req, res) => {
    const { email } = req.body;
    let otp = generateOtp();
    const current = await OTPModel.findOne({ email });
    if (current) {
        current.otp = otp;
        current.createdAt = Date.now();
        current.save();
    } else await OTPModel.create({ otp, email });
    res.status(200).json({ success: true });
};

export const verifyOTP = async (req, res) => {
    let { email, otp } = req.body;
    if (typeof otp === "string") otp = parseInt(otp);
    const storedOtp = await OTPModel.findOne({ email, otp });
    if (!storedOtp)
        throw new ClientFaultError("The verification code is invalid");
    return res.status(200).json({ success: true });
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30 days",
    });
    res.status(201).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
    await OTPModel.deleteOne({ email });
};

export const getCurrentUser = async (req, res) => {
    res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

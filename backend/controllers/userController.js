import OTPModel from "../models/otp.model.js";
import generateOtp from "../utils/otp.util.js";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

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

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30 days" }
    );
    res.status(201).json({
        success: true,
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

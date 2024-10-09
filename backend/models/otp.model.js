import { Schema, model } from "mongoose";
import sendEmail from "../config/nodemailer.config.js";

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5,
    },
});

otpSchema.pre("save", async function (next) {
    await sendEmail(
        this.email,
        "MKC-Choir Email Verification",
        `Your verification code is ${this.otp}`
    );
    next();
});

const OTPModel = model("OTP", otpSchema);

export default OTPModel;

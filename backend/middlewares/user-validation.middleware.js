import {
    loginBodySchema,
    registerOTPBodySchema,
    registerOTPQuerySchema,
    registerUserBodySchema,
    resetPasswordBodySchema,
    verifyOTPBodySchema,
} from "../models/validation-schemas/user.validaton-schema.js";
import validateSchema from "../utils/validator.util.js";

export const validateRegisterUser = async (req, _res, next) => {
    await validateSchema(req.body, registerUserBodySchema);
    next();
};

export const validateRegisterOTP = async (req, _res, next) => {
    await validateSchema(req.body, registerOTPBodySchema);
    await validateSchema(req.query, registerOTPQuerySchema);
    next();
};

export const validateLogin = async (req, _res, next) => {
    await validateSchema(req.body, loginBodySchema);
    next();
};

export const validateVerifyOTP = async (req, _res, next) => {
    await validateSchema(req.body, verifyOTPBodySchema);
    next();
};

export const validateResetPassword = async (req, _res, next) => {
    await validateSchema(req.body, resetPasswordBodySchema);
    next();
};

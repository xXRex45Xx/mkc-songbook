import {
    loginBodySchema,
    registerOTPBodySchema,
    registerUserBodySchema,
} from "../models/validation-schemas/user.validaton-schema.js";
import validateSchema from "../utils/validator.util.js";

export const validateRegisterUser = async (req, _res, next) => {
    await validateSchema(req.body, registerUserBodySchema);
    next();
};

export const validateRegisterOTP = async (req, _res, next) => {
    await validateSchema(req.body, registerOTPBodySchema);
    next();
};

export const validateLogin = async (req, _res, next) => {
    await validateSchema(req.body, loginBodySchema);
    next();
};

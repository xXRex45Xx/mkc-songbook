import Joi from "joi";

export const registerUserBodySchema = Joi.object({
    email: Joi.string()
        .regex(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        .email()
        .required(),
    name: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(8).max(100).required(),
    otp: Joi.number()
        .integer()
        .positive()
        .min(100000)
        .max(999999)
        .required()
        .messages({
            "number.min": "The validation code must be a 6 digit number.",
            "number.max": "The validation code must be a 6 digit number.",
        }),
}).required();

export const registerOTPBodySchema = Joi.object({
    email: Joi.string()
        .regex(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        .email()
        .required(),
}).required();

export const loginBodySchema = Joi.object({
    email: Joi.string()
        .regex(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        .email()
        .required(),
    password: Joi.string().min(8).max(100).required(),
}).required();

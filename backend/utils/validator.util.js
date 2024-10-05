import Joi from "joi";
import { ClientFaultError, ServerFaultError } from "./error.util.js";

const validateSchema = async (payload, schema) => {
    try {
        const validation = await schema.validateAsync(payload, {
            abortEarly: false,
        });

        if (validation.error) {
            const message = validation.error.details
                .map((err) => err.message)
                .join(", ");
            throw new ClientFaultError(message);
        }
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            const message = error.details.map((err) => err.message).join(", ");
            throw new ClientFaultError(message);
        }
        throw new ServerFaultError(error);
    }
};

export default validateSchema;

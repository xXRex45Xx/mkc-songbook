import { ClientFaultError } from "./error.util.js";

const validateSchema = async (payload, schema) => {
    const validation = await schema.validateAsync(payload, {
        abortEarly: false,
    });

    if (validation.error) {
        const message = validation.error.details
            .map((err) => err.message)
            .join(", ");
        throw new ClientFaultError(message);
    }
};

export default validateSchema;

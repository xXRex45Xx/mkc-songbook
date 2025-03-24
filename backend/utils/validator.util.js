import Joi from "joi";
import { ClientFaultError, ServerFaultError } from "./error.util.js";

/**
 * Schema Validation Utility Module.
 * Provides functionality for validating data against Joi schemas.
 * @module utils/validator
 */

/**
 * Validates a payload against a Joi schema.
 * Throws ClientFaultError if validation fails with detailed error messages.
 * Throws ServerFaultError for unexpected validation errors.
 *
 * @async
 * @param {Object} payload - The data to validate
 * @param {Joi.Schema} schema - The Joi schema to validate against
 * @throws {ClientFaultError} When validation fails with validation errors
 * @throws {ServerFaultError} When an unexpected error occurs during validation
 */
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

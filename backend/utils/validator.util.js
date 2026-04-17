import Joi from "joi";
import { ClientFaultError, ServerFaultError } from "./error.util.js";

/**
 * Schema Validation Utility Module.
 * Provides functionality for validating data against Joi schemas.
 * Used to ensure request payloads conform to expected data structures and constraints.
 * @module utils/validator
 */

/**
 * Validates a payload against a Joi schema.
 * Throws ClientFaultError if validation fails with detailed error messages.
 * Throws ServerFaultError for unexpected validation errors.
 * Uses abortEarly: false to collect all validation errors before throwing.
 *
 * @async
 * @param {Object} payload - The data to validate
 * @param {Joi.Schema} schema - The Joi schema to validate against
 * @returns {Promise<void>} Resolves if validation passes, rejects with error if validation fails
 * @throws {ClientFaultError} When validation fails with validation errors
 * @throws {ServerFaultError} When an unexpected error occurs during validation
 * @example
 * // Validate user registration data
 * const userSchema = Joi.object({
 *     email: Joi.string().email().required(),
 *     password: Joi.string().min(8).required()
 * });
 * await validateSchema({ email: 'user@example.com', password: 'secure123' }, userSchema);
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

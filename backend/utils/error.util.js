/**
 * Error Handling Utilities Module.
 * Provides error handling utilities and custom error classes for the application.
 * @module utils/error
 */

/**
 * Wraps an async route handler to automatically catch errors and pass them to Express error handler.
 * If the error has a statusCode, it's passed directly; otherwise, it's wrapped in a ServerFaultError.
 * @param {Function} fn - Async route handler function to wrap
 * @returns {Function} Wrapped route handler that catches errors
 */
export const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((e) => {
            if (e.statusCode) return next(e);
            next(new ServerFaultError(e));
        });
    };
};

/**
 * Base class for client-side errors (4xx status codes).
 * @extends Error
 */
export class ClientFaultError extends Error {
    /**
     * Creates a new ClientFaultError.
     * @param {string} message - Error message
     * @param {number} [statusCode=400] - HTTP status code
     */
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Error class for unauthorized access (401 status code).
 * @extends ClientFaultError
 */
export class UnauthorizedError extends ClientFaultError {
    /**
     * Creates a new UnauthorizedError.
     * @param {string} message - Error message
     */
    constructor(message) {
        super(message, 401);
    }
}

/**
 * Error class for forbidden access (403 status code).
 * @extends ClientFaultError
 */
export class ForbiddenError extends ClientFaultError {
    /**
     * Creates a new ForbiddenError.
     * @param {string} message - Error message
     */
    constructor(message) {
        super(message, 403);
    }
}

/**
 * Error class for server-side errors (500 status code).
 * Wraps internal errors with a generic message for client responses.
 * @extends Error
 */
export class ServerFaultError extends Error {
    /**
     * Creates a new ServerFaultError.
     * @param {Error} internalError - Original error to wrap
     */
    constructor(internalError) {
        super("Internal server error");
        this.internalError = internalError;
        this.statusCode = 500;
    }
}

/**
 * Error class for resource not found (404 status code).
 * @extends ClientFaultError
 */
export class NotFoundError extends ClientFaultError {
    /**
     * Creates a new NotFoundError.
     * @param {string} message - Error message
     */
    constructor(message) {
        super(message, 404);
    }
}

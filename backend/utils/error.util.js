/**
 * Error Handling Utilities Module.
 * Provides error handling utilities and custom error classes for the application.
 * @module utils/error
 */

/**
 * Wraps an async route handler to automatically catch errors and pass them to Express error handler.
 * If the error has a statusCode, it's passed directly; otherwise, it's wrapped in a ServerFaultError.
 * This utility ensures all async errors are properly handled by Express middleware without
 * requiring try-catch blocks in every route handler.
 *
 * @param {Function} fn - Async route handler function to wrap
 * @returns {Function} Wrapped route handler that catches errors and passes them to Express next()
 * @example
 * // Usage in Express route:
 * router.get('/data', wrapAsync(async (req, res, next) => {
 *     const data = await getData();
 *     res.json(data);
 * }));
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
 * Represents errors where the client has made a request that cannot be processed
 * due to client-side issues (validation errors, missing data, etc.).
 * @extends Error
 */
export class ClientFaultError extends Error {
    /**
     * Creates a new ClientFaultError.
     * @param {string} message - Descriptive error message explaining what went wrong
     * @param {number} [statusCode=400] - HTTP status code (default 400 for bad request)
     * @example
     * // Create error for invalid input
     * throw new ClientFaultError('Invalid email format');
     */
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Error class for unauthorized access (401 status code).
 * Represents errors when authentication is required but not provided, invalid, or expired.
 * Used when a user attempts to access protected resources without proper credentials.
 * @extends ClientFaultError
 */
export class UnauthorizedError extends ClientFaultError {
    /**
     * Creates a new UnauthorizedError.
     * @param {string} message - Error message explaining the authentication failure
     * @example
     * // Throw when user is not logged in
     * throw new UnauthorizedError('Authentication required');
     */
    constructor(message) {
        super(message, 401);
    }
}

/**
 * Error class for forbidden access (403 status code).
 * Represents errors when the user is authenticated but lacks permission to access the resource.
 * Used when a user attempts to perform actions they don't have authorization for.
 * @extends ClientFaultError
 */
export class ForbiddenError extends ClientFaultError {
    /**
     * Creates a new ForbiddenError.
     * @param {string} message - Error message explaining the permission denial
     * @example
     * // Throw when user lacks admin privileges
     * throw new ForbiddenError('Admin access required');
     */
    constructor(message) {
        super(message, 403);
    }
}

/**
 * Error class for server-side errors (500 status code).
 * Wraps internal errors with a generic message for client responses.
 * This prevents sensitive server information from being exposed to clients while
 * preserving the original error for logging and debugging purposes.
 * @extends Error
 */
export class ServerFaultError extends Error {
    /**
     * Creates a new ServerFaultError.
     * @param {Error} internalError - Original error to wrap and log
     * @example
     * // Wrap database connection error
     * throw new ServerFaultError(new Error('Database connection failed'));
     */
    constructor(internalError) {
        super("Internal server error");
        this.internalError = internalError;
        this.statusCode = 500;
    }
}

/**
 * Error class for resource not found (404 status code).
 * Represents errors when a requested resource does not exist.
 * Used when looking up entities by ID or searching for resources that cannot be found.
 * @extends ClientFaultError
 */
export class NotFoundError extends ClientFaultError {
    /**
     * Creates a new NotFoundError.
     * @param {string} message - Error message indicating what resource was not found
     * @example
     * // Throw when album not found in database
     * throw new NotFoundError('Album with ID 123 not found');
     */
    constructor(message) {
        super(message, 404);
    }
}

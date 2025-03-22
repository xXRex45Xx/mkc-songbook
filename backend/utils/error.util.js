export const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((e) => {
            if (e.statusCode) return next(e);
            next(new ServerFaultError(e));
        });
    };
};

export class ClientFaultError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class UnauthorizedError extends ClientFaultError {
    constructor(message) {
        super(message, 401);
    }
}

export class ForbiddenError extends ClientFaultError {
    constructor(message) {
        super(message, 403);
    }
}

export class ServerFaultError extends Error {
    constructor(internalError) {
        super("Internal server error");
        this.internalError = internalError;
        this.statusCode = 500;
    }
}

export class NotFoundError extends ClientFaultError {
    constructor(message) {
        super(message, 404);
    }
}

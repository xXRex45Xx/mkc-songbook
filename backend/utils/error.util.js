export const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((e) => next(e));
    };
};

export class ClientFaultError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class ServerFaultError extends Error {
    constructor(internalError) {
        super("Internal server error");
        this.internalError = internalError;
    }
}

export class NotFoundError extends ClientFaultError {
    constructor(message) {
        super(message, 404);
    }
}

// src/errors/BaseError.ts
export class BaseError extends Error {
    public statusCode: number;
    public isOperational: boolean; // True: error esperado, False: bug inesperado

    constructor(message: string, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Mantener stack trace correcto
        Error.captureStackTrace(this, this.constructor);
    }
}

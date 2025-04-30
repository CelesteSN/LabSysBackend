"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
// src/errors/BaseError.ts
class BaseError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Mantener stack trace correcto
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;

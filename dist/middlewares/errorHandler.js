"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const baseErrors_1 = require("../errors/baseErrors");
function errorHandler(err, req, res, next) {
    console.error(err); // Podés dejar el console para logs internos, no afecta el response
    if (err instanceof baseErrors_1.BaseError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }
    // Otros errores inesperados
    return res.status(500).json({
        success: false,
        error: {
            message: 'Error interno del servidor'
        }
    });
}

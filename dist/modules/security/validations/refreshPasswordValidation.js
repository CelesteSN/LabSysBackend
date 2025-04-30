"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoveryPasswordValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.recoveryPasswordValidation = joi_1.default.object({
    email: joi_1.default.string()
        .trim()
        .email()
        .required()
        .messages({
        "string.empty": "El correo electrónico es obligatorio.",
        "string.email": "Debe ser un correo electrónico válido.",
    }),
});

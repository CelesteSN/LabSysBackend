"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserValidation = joi_1.default.object({
    firstName: joi_1.default.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .required()
        .messages({
        "string.empty": "El nombre es obligatorio.",
        "string.min": "El nombre debe tener al menos 3 caracteres.",
        "string.max": "El nombre no debe tener más de 30 caracteres.",
        "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),
    lastName: joi_1.default.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .required()
        .messages({
        "string.empty": "El apellido es obligatorio.",
        "string.min": "El apellido debe tener al menos 3 caracteres.",
        "string.max": "El apellido no debe tener más de 30 caracteres.",
        "string.pattern.base": "El apellido solo puede contener letras y espacios.",
    }),
    email: joi_1.default.string()
        .trim()
        .email()
        .required()
        .messages({
        "string.empty": "El correo electrónico es obligatorio.",
        "string.email": "Debe ser un correo electrónico válido.",
    }),
    password: joi_1.default.string()
        .trim()
        .min(8)
        .max(20)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
        .required()
        .messages({
        "string.empty": "La contraseña es obligatoria.",
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "string.max": "La contraseña no debe superar los 20 caracteres.",
        "string.pattern.base": "La contraseña debe contener al menos una mayúscula, una minúscula y un número.",
    }),
    phone_number: joi_1.default.string()
        .pattern(/^\d{8,15}$/)
        .optional()
        .messages({
        "string.pattern.base": "El teléfono debe tener entre 8 y 15 dígitos numéricos.",
    }),
    dni: joi_1.default.string()
        .min(7)
        .max(10)
        .pattern(/^[A-Za-z0-9]+$/)
        .required()
        .messages({
        "string.empty": "El DNI es obligatorio.",
        "string.min": "El DNI debe tener al menos 7 caracteres.",
        "string.max": "El DNI no debe superar los 10 caracteres.",
        "string.pattern.base": "El DNI debe contener solo número.",
    }),
    personalFile: joi_1.default.string()
        .min(3)
        .max(10)
        .pattern(/^[A-Za-z0-9]+$/)
        .required()
        .messages({
        "string.empty": "El Legajo es obligatorio.",
        "string.min": "El Legajo debe tener al menos 7 caracteres.",
        "string.max": "El Legajo no debe superar los 10 caracteres.",
        "string.pattern.base": "El Legajo debe contener solo número.",
    }),
    roleId: joi_1.default.string()
        .uuid()
        .required()
        .messages({
        "string.guid": "El rol debe ser un UUID válido.",
        "any.required": "El rol es obligatorio."
    }),
});

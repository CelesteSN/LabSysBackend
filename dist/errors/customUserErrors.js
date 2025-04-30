"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UserNotFoundError = exports.StatusNotFoundError = exports.RoleNotFoundError = exports.EmailAlreadyExistsError = void 0;
// src/errors/customErrors.ts
const baseErrors_1 = require("./baseErrors");
class EmailAlreadyExistsError extends baseErrors_1.BaseError {
    constructor() {
        super("Hubo un error al crear el usuario. Ya existe el usuario con el correo electrónico. Inicie sesión en la plataforma o utilice otro correo para registrarse.", 409); // 409 Conflict
    }
}
exports.EmailAlreadyExistsError = EmailAlreadyExistsError;
class RoleNotFoundError extends baseErrors_1.BaseError {
    constructor() {
        super("Rol no encontrado", 404); // 404 Not Found
    }
}
exports.RoleNotFoundError = RoleNotFoundError;
class StatusNotFoundError extends baseErrors_1.BaseError {
    constructor() {
        super("Estado no encontrado", 404); // 404 Not Found
    }
}
exports.StatusNotFoundError = StatusNotFoundError;
class UserNotFoundError extends baseErrors_1.BaseError {
    constructor() {
        super("Usuario no encontrado", 404);
    }
}
exports.UserNotFoundError = UserNotFoundError;
// Otros errores iguales...
class ForbiddenError extends baseErrors_1.BaseError {
    constructor() {
        super("No tiene permiso para acceder a este listado", 404);
    }
}
exports.ForbiddenError = ForbiddenError;

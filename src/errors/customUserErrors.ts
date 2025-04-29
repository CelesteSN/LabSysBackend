// src/errors/customErrors.ts
import { BaseError } from './baseErrors';

export class EmailAlreadyExistsError extends BaseError {
    constructor() {
        super("Hubo un error al crear el usuario. Ya existe el usuario con el correo electrónico. Inicie sesión en la plataforma o utilice otro correo para registrarse.", 409); // 409 Conflict
    }
}

export class RoleNotFoundError extends BaseError {
    constructor() {
        super("Rol no encontrado", 404); // 404 Not Found
    }
}
export class StatusNotFoundError extends BaseError {
    constructor() {
        super("Estado no encontrado", 404); // 404 Not Found
    }
}
export class UserNotFoundError extends BaseError {
    constructor(){
        super("Usuario no encontrado", 404);
    }
}
// Otros errores iguales...


export class ForbiddenError extends BaseError {
    constructor(){
        super("No tiene permiso para acceder a este listado", 404);
    }
}
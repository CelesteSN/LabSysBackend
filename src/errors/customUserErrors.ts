// src/errors/customErrors.ts
import { BaseError } from './baseErrors';

export class EmailAlreadyExistsError extends BaseError {
    constructor() {
        super("Hubo un error al crear el usuario. Ya existe el usuario con el correo electrónico. Inicie sesión en la plataforma o utilice otro correo para registrarse.", 409); // 409 Conflict
    }
}


export class UserAlreadyDeletedError extends BaseError {
    constructor() {
        super("El usuario ya fue eliminado.", 409); // 409 Conflict
    }
}
// En tu archivo de errores personalizados
export class ForbiddenAccessError extends Error {
    constructor(message = "No puede acceder a este recurso") {
        super(message);
        this.name = "ForbiddenAccessError";
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
export class NameUsedError extends BaseError {
    constructor(){
        super("El nombre ya esta en uso", 404);
    }
}


export class NotFoundResultsError extends BaseError {
    constructor(){
        super("No se encontraron resultados", 404);
    }
}
export class OrderExistsError extends BaseError {
    constructor(){
        super("El orden ya esta en uso", 404);
    }
}

export class UserPendingError extends BaseError {
    constructor(){
        super("La cuenta no ha sido confirmada. Recuerde que para acceder a la plataforma, su solicitud deberá ser aprobada. Se le notificará por correo electrónico cuando su solicitud sea aprobada o rechazada", 404);
    }
}

// Otros errores iguales...

export class ForbiddenError extends BaseError {
    constructor(){
        super("No tiene permiso para acceder a este listado", 404);
    }
}
// src/errors/customErrors.ts
import { BaseError } from './baseErrors';

export class EmailAlreadyExistsError extends BaseError {
    constructor() {
        super("Hubo un error al crear el usuario. Ya existe el usuario con el correo electrónico. Inicie sesión en la plataforma o utilice otro correo para registrarse.", 409); // 409 Conflict
    }
}
export class ProjectWithoutStagesError extends BaseError {
    constructor() {
        super("El proyecto tiene etapas, pero no tiene tareas asignadas", 409); // 409 Conflict
    }
}

export class NotFoundStagesError extends BaseError {
    constructor() {
        super("El proyecto no tiene etapas asignadas", 409); // 409 Conflict
    }
}

export class BadRequestStartDateStageError extends BaseError {
    constructor() {
        super("La fecha de inicio de la etapa no puede ser anterior a la fecha de inicio del proyecto.", 409); // 409 Conflict
    }
}


export class NotFoundProjectError extends BaseError {
    constructor() {
        super("No es posible realizar esta acción sobre el proyecto.", 409); // 409 Conflict
    }
}
export class BadRequestEndDateStageError extends BaseError {
    constructor() {
        super("La fecha de finalización de la etapa no puede ser posterior a la fecha de fin del proyecto.", 409); // 409 Conflict
    }
}



export class UserAlreadyDeletedError extends BaseError {
    constructor() {
        super("El usuario ya fue eliminado.", 409); // 409 Conflict
    }
}
export class StageStatusNotFound extends BaseError {
    constructor() {
        super("El proyecto ya esta en progreso o finalizado, solo puede añadir etapas al final.", 409); // 409 Conflict
    }
}


export class NotModifiOrDeleteCommentError extends BaseError {
    constructor() {
        super("No es posible modificar o eliminar el comentario porque ha pasado más de 60 minutos a partir de su publicación.", 409); // 409 Conflict
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

export class BadRequestError extends BaseError {
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

export class NotValidDatesError extends BaseError {
    constructor(){
        super("La fecha de finalización debe ser igual o posterior a la fecha de inicio.", 404);
    }
}



// Otros errores iguales...

export class ForbiddenError extends BaseError {
    constructor(){
        super("No tiene permiso para acceder a este listado", 404);
    }
}
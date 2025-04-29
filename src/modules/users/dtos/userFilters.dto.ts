// src/modules/users/dtos/userFilter.dto.ts
export interface UserFilter {
    search?: string;            // Búsqueda por nombre o apellido
    fromDate?: Date;             // Fecha de solicitud desde
    toDate?: Date;               // Fecha de solicitud hasta
}

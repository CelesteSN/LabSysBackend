import { UserStatusEnum } from "../enums/userStatus.enum";
import { RoleEnum } from "../enums/role.enum";
export interface UserFilter {
    search?: string;            // Búsqueda por nombre o apellido
    fromDate?: Date;             // Fecha de solicitud desde
    toDate?: Date;   // Fecha de solicitud hasta
    status?: UserStatusEnum;
    role?: RoleEnum;  
    pageNumber: number; 
}


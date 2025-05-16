import { ProjectStatusEnum } from "../enums/projectStatus.enum";

export interface ProjectFilter {
    search?: string;            // Búsqueda por nombre o apellido
    status?: ProjectStatusEnum;
    pageNumber: number; 
}


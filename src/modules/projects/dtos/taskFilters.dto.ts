import { TaskStatusEnum } from "../enums/taskStatus.enum";

export interface TaskFilter {
    search?: string;            // Búsqueda por nombre o apellido
    status?: TaskStatusEnum;
    priority?: number
    pageNumber: number; 
}



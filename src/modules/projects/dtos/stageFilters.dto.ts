import { StageStatusEnum } from "../enums/stageStatus.enum";


export interface StageFilter {
    search?: string;            // Búsqueda por nombre o apellido
    status?: StageStatusEnum;
    pageNumber: number; 
}



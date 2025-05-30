import { CommentTypeEnum } from "../enums/commentType.enum";

export interface TaskFilter {
    //search?: string;            // Búsqueda por contenido del comentarios
    //type?: CommentTypeEnum;
    date?: string
    pageNumber: number; 
}



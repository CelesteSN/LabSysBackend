import { Router } from "express";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';

export const reportRouter = Router();

//	Porcentaje de avance del proyecto
reportRouter.get("/progress",authenticateToken,checkBlacklist, );

//Cantidad total de tareas atrasadas
reportRouter.get("/overdue-tasks",authenticateToken,checkBlacklist);

//Comentarios + archivos por becario
reportRouter.get("/participation",authenticateToken,checkBlacklist);


//Cantidad de tareas por estado y becario (agrupadas)
reportRouter.get("/task-distribution",authenticateToken,checkBlacklist);	

//Listado con tareas atrasadas por etapa y becario
reportRouter.get("/overdue-by-stage",authenticateToken,checkBlacklist);	
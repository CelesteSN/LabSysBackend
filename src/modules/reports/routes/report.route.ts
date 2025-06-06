import { Router } from "express";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import {getFullReport} from "../controllers/report.controller"

export const reportRouter = Router();

//	Porcentaje de avance del proyecto
reportRouter.get("/project/:projectId",authenticateToken,checkBlacklist, getFullReport);

//Cantidad total de tareas atrasadas
//reportRouter.get("/project/:projectId/overdue-tasks",authenticateToken,checkBlacklist, getDelayedTasks);

//Comentarios + archivos por becario
//reportRouter.get("/project/:projectId/participation",authenticateToken,checkBlacklist, getUserParticipationChart);


//Cantidad de tareas por estado y becario (agrupadas)
//reportRouter.get("/project/:projectId/task-distribution",authenticateToken,checkBlacklist, getTaskDistributionChart);	

//Listado con tareas atrasadas por etapa y becario
//reportRouter.get("/project/:projectId/overdue-by-stage",authenticateToken,checkBlacklist);	
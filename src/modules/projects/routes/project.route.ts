import { Router } from "express";
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject, getMembers, addMemberToProject, deleteMemberToProject, getAllStages, createStage, updateStage, deleteStageToProject, getAllProjectType, getAllUsersProject} from "../controllers/project.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { projectValidationSchema } from '../validations/createProject.validation';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import { searchValidation } from '../validations/getAllProjectsQueryParam.validation';
import { updateProjectSchema } from "../validations/updateProject.validation";
import {addMembersSchema} from "../validations/addMembers.validation";
import {deleteMemberSchema} from "../validations/deleteMember.validation";
import {stageSchema} from "../validations/createStage.schema";



export const projectRouter = Router();
// 🟢 Rutas más específicas van primero
// 🔵 Luego las más generales

//tipo de proyectos


projectRouter.get('/project-type',authenticateToken,checkBlacklist,  getAllProjectType);


// 🔹 Operaciones sobre etapas de un proyecto
projectRouter.get('/:projectId/stages',authenticateToken,checkBlacklist,  getAllStages);
projectRouter.post('/:projectId/stages',authenticateToken,checkBlacklist,validateRequest({body: stageSchema}),  createStage);

projectRouter.put('/stage/:stageId',authenticateToken,checkBlacklist,validateRequest({body: stageSchema}), updateStage);
projectRouter.delete('/stage/:stageId',authenticateToken,checkBlacklist,  deleteStageToProject);


// // 🔹 Operaciones sobre miembros de un proyecto
projectRouter.get('/:projectId/users',authenticateToken,checkBlacklist,  getAllUsersProject);
projectRouter.get('/:projectId/members',authenticateToken,checkBlacklist,  getMembers);
projectRouter.post('/:projectId/members',authenticateToken,checkBlacklist,validateRequest({body: addMembersSchema}),  addMemberToProject);
projectRouter.delete('/:projectId/members',authenticateToken,checkBlacklist, validateRequest({body: deleteMemberSchema}), deleteMemberToProject);


// 🔸 Operaciones generales de proyecto
projectRouter.get("/", authenticateToken, checkBlacklist, validateRequest({ query: searchValidation }), getAllProjects);
projectRouter.post("/", authenticateToken, checkBlacklist, validateRequest({ body: projectValidationSchema }), createProject);

// 🔹 Operaciones específicas sobre un proyecto
projectRouter.get("/:projectId", authenticateToken, checkBlacklist, getProjectById);
projectRouter.put("/:projectId", authenticateToken, checkBlacklist, validateRequest({ body: updateProjectSchema }), updateProject);
projectRouter.delete("/:projectId", authenticateToken, checkBlacklist, deleteProject);

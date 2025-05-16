import { Router } from "express";
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject} from "../controllers/project.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { projectValidationSchema } from '../validations/createProject.validation';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import { searchValidation } from '../validations/getAllProjectsQueryParam.validation';
//import { responseUserValidate } from "../validations/responseUserValidation";
import { updateProjectSchema } from "../validations/updateProject.validation";




export const projectRouter = Router();



//userRouter.get('/roles', showAllRole);

projectRouter.get("/", authenticateToken, checkBlacklist, validateRequest({ query: searchValidation }), getAllProjects);

projectRouter.post("/", authenticateToken, checkBlacklist, validateRequest({ body: projectValidationSchema }), createProject);

// 🟢 Rutas más específicas van primero
//userRouter.put("/:id/answer", authenticateToken, checkBlacklist, validateRequest({ body: responseUserValidate }), answerUser);

// 🔵 Luego las más generales
projectRouter.get("/:id", authenticateToken, checkBlacklist, getProjectById);

projectRouter.put("/:id", authenticateToken, checkBlacklist, 
    validateRequest({ body: updateProjectSchema }),
     updateProject);

projectRouter.delete("/:id", authenticateToken, checkBlacklist, deleteProject);

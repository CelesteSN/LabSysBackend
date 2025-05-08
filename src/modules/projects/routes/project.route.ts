import { Router } from "express";
import { createProject} from "../controllers/project.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
//import { createUserValidation } from '../validations/createUserValidation';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
//import { searchValidation } from '../validations/getAllUsersQueryParam.validation';
//import { responseUserValidate } from "../validations/responseUserValidation";
//import { updatedUserValidation } from "../validations/updatedUserValidation";




export const projectRouter = Router();



//userRouter.get('/roles', showAllRole);

//userRouter.get("/", authenticateToken, checkBlacklist, validateRequest({ query: searchValidation }), getAllUsers);

projectRouter.post("/",
    // validateRequest({ body: createUserValidation }), 
     createProject);

// 🟢 Rutas más específicas van primero
//userRouter.put("/:id/answer", authenticateToken, checkBlacklist, validateRequest({ body: responseUserValidate }), answerUser);

// 🔵 Luego las más generales
//userRouter.get("/:id", authenticateToken, checkBlacklist, getUserById);

//userRouter.put("/:id", authenticateToken, checkBlacklist, validateRequest({ body: updatedUserValidation }), updateUser);

//userRouter.delete("/:id", authenticateToken, checkBlacklist, deleteUser);

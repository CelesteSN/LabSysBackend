import { Router } from "express";
import { getAllTask, createTask, getTaskById, updateTask, deleteTask} from "../controllers/task.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createTaskSchema } from '../schemas/createTask.schema';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
// import { searchValidation } from '../validations/getAllUsersQueryParam.validation';
// import { responseUserValidate } from "../validations/responseUserValidation";
import { updateTaskSchema } from "../schemas/updateTask.schema";




export const taskRouter = Router();



//userRouter.get('/roles', 
  //  showAllRole);

taskRouter.get("/", 
    authenticateToken, 
    checkBlacklist, 
    //validateRequest({ query: searchValidation }), 
    getAllTask);

taskRouter.post("/", 
    authenticateToken,
    validateRequest({ body: createTaskSchema }), 
    createTask);

// 🟢 Rutas más específicas van primero
// userRouter.put("/:id/answer", 
//     authenticateToken, 
//     checkBlacklist, 
//     validateRequest({ body: responseUserValidate }), 
//     answerUser);

// // 🔵 Luego las más generales
taskRouter.get("/:taskId", 
  authenticateToken, 
  checkBlacklist, 
  getTaskById);

taskRouter.put("/:taskId", 
   authenticateToken, 
  checkBlacklist, 
  validateRequest({ body: updateTaskSchema }), 
  updateTask);

taskRouter.delete("/:taskId", 
    authenticateToken, 
    checkBlacklist, 
    deleteTask);

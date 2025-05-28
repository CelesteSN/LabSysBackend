import { Router } from "express";
import {  createTask, getTaskById, updateTask, deleteTask, getAllComments, createComment, updateComment, deleteComment} from "../controllers/task.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createTaskSchema } from '../schemas/createTask.schema';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
// import { searchValidation } from '../validations/getAllUsersQueryParam.validation';
// import { responseUserValidate } from "../validations/responseUserValidation";
import { updateTaskSchema } from "../schemas/updateTask.schema";




export const taskRouter = Router();

//Rutas de comentario
taskRouter.post("/comments", 
    authenticateToken, checkBlacklist,
    //validateRequest({ body: createTaskSchema }), 
    createComment);
taskRouter.get('/:taskId/comments', authenticateToken,checkBlacklist, getAllComments);

taskRouter.put("/comments/:commentId", 
   authenticateToken, 
  checkBlacklist, 
  ///validateRequest({ body: updateTaskSchema }), 
  updateComment);

taskRouter.delete("/comments/:commentId", 
    authenticateToken, 
    checkBlacklist, 
    deleteComment);

    //Rutas de tareas
taskRouter.post("/", 
    authenticateToken,
    validateRequest({ body: createTaskSchema }), 
    createTask);

// 🟢 Rutas más específicas van primero


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

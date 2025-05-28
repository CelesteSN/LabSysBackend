import { Router } from "express";
import {  createTask, getTaskById, updateTask, deleteTask, getAllComments, createComment, updateComment, deleteComment, getCommentById} from "../controllers/task.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createTaskSchema } from '../schemas/createTask.schema';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import { updateTaskSchema } from "../schemas/updateTask.schema";
import {createCommentSchema} from "../schemas/createComment.schema";
import {updateCommentSchema} from "../schemas/updateComment.schema";
import {AllCommentFiltersSchema} from "../schemas/allCommentFilter.schema";



export const taskRouter = Router();

//Rutas de adjuntos


//Rutas de comentario
taskRouter.post("/comments", authenticateToken, checkBlacklist,validateRequest({ body: createCommentSchema }), createComment);
taskRouter.get('/comments/:commentId', authenticateToken,checkBlacklist, validateRequest({query: AllCommentFiltersSchema}), getCommentById);
taskRouter.get('/:taskId/comments', authenticateToken,checkBlacklist, validateRequest({query: AllCommentFiltersSchema}), getAllComments);
taskRouter.put("/comments/:commentId", authenticateToken, checkBlacklist, validateRequest({ body: updateCommentSchema }), updateComment);
taskRouter.delete("/comments/:commentId", authenticateToken, checkBlacklist, deleteComment);

//Rutas de tareas
taskRouter.post("/", authenticateToken, validateRequest({ body: createTaskSchema }), createTask);
taskRouter.get("/:taskId", authenticateToken, checkBlacklist, getTaskById);
taskRouter.put("/:taskId", authenticateToken, checkBlacklist, validateRequest({ body: updateTaskSchema }), updateTask);
taskRouter.delete("/:taskId", authenticateToken, checkBlacklist, deleteTask);

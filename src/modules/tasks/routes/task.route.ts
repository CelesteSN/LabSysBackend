import { Router } from "express";
import {  createTask, getTaskById, updateTask, deleteTask, getAllComments, createComment, updateComment, deleteComment, getCommentById, getAllTaskStatus} from "../controllers/task.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createTaskSchema } from '../schemas/createTask.schema';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import { updateTaskSchema } from "../schemas/updateTask.schema";
import {createCommentSchema} from "../schemas/createComment.schema";
import {updateCommentSchema} from "../schemas/updateComment.schema";
import {AllCommentFiltersSchema} from "../schemas/allCommentFilter.schema";
import { deleteAttachment, handleTaskFileUpload , downloadAttachment} from "../controllers/attachment.controller";


import cloudinaryUpload from '../../../config/cloudinary.storage';


export const taskRouter = Router();

//Rutas de adjuntos
taskRouter.get('/attachments/:attachmentId/download', authenticateToken, checkBlacklist, downloadAttachment);
taskRouter.post("/:taskId/upload",authenticateToken, checkBlacklist,cloudinaryUpload.single('file'), handleTaskFileUpload);
taskRouter.delete("/attachments/:attachmentId",authenticateToken, checkBlacklist, deleteAttachment);



//Rutas de comentario
taskRouter.post("/comments", authenticateToken, checkBlacklist,validateRequest({ body: createCommentSchema }), createComment);
taskRouter.get('/comments/:commentId', authenticateToken,checkBlacklist, getCommentById);
taskRouter.get('/:taskId/comments', authenticateToken,checkBlacklist, validateRequest({query: AllCommentFiltersSchema}), getAllComments);
taskRouter.put("/comments/:commentId", authenticateToken, checkBlacklist, validateRequest({ body: updateCommentSchema }), updateComment);
taskRouter.delete("/comments/:commentId", authenticateToken, checkBlacklist, deleteComment);

//Rutas de tareas
taskRouter.get("/taskStatus",authenticateToken, checkBlacklist, getAllTaskStatus);
taskRouter.post("/", authenticateToken, validateRequest({ body: createTaskSchema }), createTask);
taskRouter.get("/:taskId", authenticateToken, checkBlacklist, getTaskById);
taskRouter.put("/:taskId", authenticateToken, checkBlacklist, validateRequest({ body: updateTaskSchema }), updateTask);
taskRouter.delete("/:taskId", authenticateToken, checkBlacklist, deleteTask);

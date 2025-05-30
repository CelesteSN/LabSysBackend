import { Request, Response } from "express";
import { Attachment } from "./../models/attachment.model"; // tu modelo
import { Task } from "../models/task.model";
import { UUID } from "sequelize";
    import { v4 as uuidv4 } from 'uuid';


export const handleTaskFileUpload = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { description } = req.body;
  const file = req.file;
      const { userLoguedId } = (req as any).user;


  if (!file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // (opcional) Validar que exista la tarea
  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  // (opcional) Obtener el usuario logueado desde middleware de auth
  //const userId = req.user?.userLoguedId; // depende de tu implementación

  const attachment = await Attachment.create({
    attachmentFileName: file.originalname,
    attachmentFileLink: file.path, // o una URL si la servís
    attachmentDescription: description || null,
    attachmentMimeType: file.mimetype,
    createdDate: new Date(),
    updatedDate: new Date(),
    attachmentTaskId: taskId,
    attachmentUserId: userLoguedId
  });

  return res.status(201).json({
    message: "Archivo subido y asociado a la tarea",
    attachment
  });
};

// import { Request, Response } from "express";
// import { Attachment } from "./../models/attachment.model"; // tu modelo
// import { Task } from "../models/task.model";
// import { UUID } from "sequelize";
//     import { v4 as uuidv4 } from 'uuid';


// export const handleTaskFileUpload = async (req: Request, res: Response) => {
//   const { taskId } = req.params;
//   const { description } = req.body;
//   const file = req.file;
//       const { userLoguedId } = (req as any).user;


//   if (!file) {
//     return res.status(400).json({ error: "No se subió ningún archivo" });
//   }

//   // (opcional) Validar que exista la tarea
//   const task = await Task.findByPk(taskId);
//   if (!task) {
//     return res.status(404).json({ error: "Tarea no encontrada" });
//   }

//   // (opcional) Obtener el usuario logueado desde middleware de auth
//   //const userId = req.user?.userLoguedId; // depende de tu implementación

//   const attachment = await Attachment.create({
//     attachmentFileName: file.originalname,
//     attachmentFileLink: file.path, // o una URL si la servís
//     attachmentDescription: description || null,
//     attachmentMimeType: file.mimetype,
//     createdDate: new Date(),
//     updatedDate: new Date(),
//     attachmentTaskId: taskId,
//     attachmentUserId: userLoguedId
//   });

//   return res.status(201).json({
//     message: "Archivo subido y asociado a la tarea",
//     attachment
//   });
// };
import { Request, Response } from "express";
import { uploadTaskAttachment, listAttachmentsByProject, getAttachmentStream } from "../services/attachment.service";
import { AuthRequest } from "../../../middlewares/auth.middleware"; // Ajustá la ruta si es distinta
import { AttachmentFilter } from "../dtos/allAttachmentFilter.dto";



export const handleTaskFileUpload = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { description } = req.body;
  const { userLoguedId } = req.user!;
  const file = req.file;


// {
//   path: 'https://res.cloudinary.com/.../upload/v123456/myfile.jpg',
//   filename: 'myfile.jpg',
//   mimetype: 'image/jpeg',
//   ...
// }


  if (!file) {
    return res.status(400).json({ message: "No se adjuntó ningún archivo" });
  }

    const attachment = await uploadTaskAttachment(taskId, userLoguedId, file, description);
    return res.status(201).json({
      message: "El archivo  fue subido exitosamente",
      //attachment
    });
  
};




export const downloadAttachment = async (req: Request, res: Response) => {
  const { attachmentId } = req.params;

  try {
    const { stream, fileName, mimeType } = await getAttachmentStream(attachmentId);

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);

    stream.pipe(res);
  } catch (error: any) {
    console.error('Error al descargar archivo:', error);
    res.status(404).json({ error: error.message || 'Error al descargar el archivo' });
  }
};

export async function getAllAttachment(req: Request, res: Response) {
  const { userLoguedId } = (req as any).user;

  const projectId = req.params.projectId

  const pageNumber = parseInt(req.query.pageNumber as string) || 0;

   const filters: AttachmentFilter = {
    pageNumber,
  search: req.query.search as string,
  //   status: req.query.status as TaskStatusEnum || undefined,
  // priority: req.query.priority != null ? Number(req.query.priority) : undefined,
 };
  

  const attachments = await listAttachmentsByProject(userLoguedId, projectId,filters  );

  if (attachments == null) {
    return res.status(200).json({
      success: true,
      //message: 'No se encontraron resultados.',
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    pageNumber,
    data: attachments,
  });
};

import { Request, Response } from "express";
import { uploadTaskAttachment, listAttachmentsByProject, getAttachmentStream, lowAttachment } from "../services/attachment.service";
import { AuthRequest } from "../../../middlewares/auth.middleware"; // Ajustá la ruta si es distinta
import { AttachmentFilter } from "../dtos/allAttachmentFilter.dto";
import { catchAsync } from "../../../utils/catchAsync";



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




export const downloadAttachment = async (req: AuthRequest, res: Response) => {
   const { userLoguedId } = req.user!;
  const { attachmentId } = req.params;

  try {
    const { stream, fileName, mimeType } = await getAttachmentStream(userLoguedId, attachmentId);

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



export const deleteAttachment = catchAsync(async (req: Request, res: Response) => {
  const attachmentId = req.params.attachmentId;
  const { userLoguedId } = (req as any).user;
  await lowAttachment(userLoguedId, attachmentId);
  res.status(200).json({
    success: true,
    message: "El comentario ha sido eliminado exitosamente"
  })
})
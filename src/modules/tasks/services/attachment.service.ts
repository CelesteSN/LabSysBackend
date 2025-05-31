import { Attachment } from "../models/attachment.model";
import { Task } from "../models/task.model";
import axios from 'axios';
import { User } from "../models/user.model";
import { AllAttachmentDto, mapAttachmentsToProjectDto, ProjectAttachmentDto } from "../dtos/allAttachment.dto";
import Stage from "../models/stage.model";
import { Project } from "../models/project.model";
import { ProjectStatus } from "../models/projectStatus.model";



export async function attachmentList(userLoguedId: string, projectId: string):Promise<ProjectAttachmentDto|null> {


  const attachmentList = await Attachment.findAll({
    attributes: ["attachmentId", "createdDate", "attachmentFileName"],
    include: [{
      model: User,
      attributes: ["userFirstName", "userLastName"]
    },
    {
      model: Task,
      attributes: ["taskTitle"],
      include: [{
        model: Stage,
        include: [{
          model: Project,
           where:{
              projectId: projectId
            },
          attributes: ["projectId"],
          include:[{
            model:ProjectStatus,
            attributes: ["projectStatusName"]
          }]
        }]
      }]
    }],
    order: [
       ['createdDate', 'ASC']
     ],
    // limit: parseInt(appConfig.ROWS_PER_PAGE),
    // offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  })
  if (attachmentList.length === 0) { return null }

  const result = mapAttachmentsToProjectDto(attachmentList);
  return result;
}



export async function uploadTaskAttachment(taskId: string, userLoguedId: string, file: Express.Multer.File, description?: string) {
  if (!file) {
    throw new Error("No se subió ningún archivo");
  }

  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Tarea no encontrada");
  }

  const attachment = await Attachment.create({
    attachmentFileName: file.originalname,
    attachmentFileLink: file.path,
    attachmentDescription: description || null,
    attachmentMimeType: file.mimetype,
    createdDate: new Date(),
    updatedDate: new Date(),
    attachmentTaskId: taskId,
    attachmentUserId: userLoguedId
  });

  return attachment;
}






export async function getAttachmentStream(attachmentId: string) {
  const attachment = await Attachment.findByPk(attachmentId);
  if (!attachment) {
    throw new Error('Archivo no encontrado');
  }

  const response = await axios.get(attachment.attachmentFileLink, {
    responseType: 'stream',
  });

  return {
    stream: response.data,
    fileName: attachment.attachmentFileName,
    mimeType: attachment.attachmentMimeType,
  };
}

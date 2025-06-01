import { Attachment } from "../models/attachment.model";
import { Task } from "../models/task.model";
import axios from 'axios';
import { User } from "../models/user.model";
import { AllAttachmentDto, mapAttachmentsToProjectDto, ProjectAttachmentDto } from "../dtos/allAttachment.dto";
import Stage from "../models/stage.model";
import { Project } from "../models/project.model";
import { ProjectStatus } from "../models/projectStatus.model";
import { validateActiveUser, validateProjectMembership } from "./task.service";
import { RoleEnum } from "../enums/role.enum";
import { AttachmentFilter } from "../dtos/allAttachmentFilter.dto";
import { Op } from "sequelize";
import { appConfig } from "../../../config/app";

import { ForbiddenAccessError } from '../../../errors/customUserErrors'; ;
import { v2 as cloudinary } from "cloudinary";
import { TaskStatus } from "../models/taskStatus.model";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import { StageStatus } from "../models/stageStatus.model";
import { StageStatusEnum } from "../../projects/enums/stageStatus.enum";
import { ProjectStatusEnum } from "../../projects/enums/projectStatus.enum";




export async function listAttachmentsByProject(
  userLoguedId: string,
  projectId: string,
  filters: AttachmentFilter
): Promise<ProjectAttachmentDto | null> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  // Si no es tutor, validar que pertenezca al proyecto
  if (userRole.roleName !== RoleEnum.TUTOR) {
    await validateProjectMembership(userLoguedId, projectId);
  }

  // Filtro de búsqueda: buscar por nombre del archivo, del propietario  y nombre de tarea
  const whereSearch: any[] = [];
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    whereSearch.push(
      { '$User.userFirstName$': { [Op.iLike]: searchTerm } },
      { '$User.userLastName$': { [Op.iLike]: searchTerm } },
      { '$Task.taskTitle$': { [Op.iLike]: searchTerm } }
    );
  }

  const attachmentList = await Attachment.findAll({
    attributes: ["attachmentId", "createdDate", "attachmentFileName"],
    where: whereSearch.length ? { [Op.or]: whereSearch } : undefined,
    include: [
      {
        model: User,
        attributes: ["userFirstName", "userLastName"]
      },
      {
        model: Task,
        required: true,
        attributes: ["taskTitle"],
        include: [{
          model: Stage,
          required: true,
          include: [{
            model: Project,
            required: true,
            where: { projectId },
            attributes: ["projectId"],
            include: [{
              model: ProjectStatus,
              attributes: ["projectStatusName"]
            }]
          }]
        }]
      }
    ],
    order: [['createdDate', 'ASC']],
    // Paginación opcional:
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  });

  if (attachmentList.length === 0) return null;
  const result = await mapAttachmentsToProjectDto(attachmentList);
    return result

}




export async function uploadTaskAttachment(taskId: string, userLoguedId: string, file: Express.Multer.File, description?: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();


  
  //Valido si el archivo existe
  if (!file) {
    throw new ForbiddenAccessError("No se subió ningún archivo");
  }


//Valido la extensión del archivo
  const allowedMimeTypes = [
  'image/jpeg', 
  'image/png',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword' // .doc
];

if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new ForbiddenAccessError("Tipo de archivo no permitido. Solo se permiten: jpg, png, pdf, txt, docx, doc");
}

  //Valido la tarea sobre la que quiero adjuntar el archivo
  const task = await Task.findOne({
    where:{
      taskId: taskId
    },
    include:[
      {model: TaskStatus,
        where: {
          taskStatusName : TaskStatusEnum.INPROGRESS
        }
      },
      {model: Stage,
        include: [{model: StageStatus,
          where: {stageStatusName: StageStatusEnum.INPROGRESS}
        },
      {model: Project,
      include:[
        {model: ProjectStatus,
          where: {
            projectStatusName : ProjectStatusEnum.INPROGRESS
          }
        }
      ]
      }]
      },      
    ]
  }
  );
  if (!task) {
    throw new ForbiddenAccessError("Tarea no encontrada o no está en estado en progreso");
  }

// 🔒 Verificar si el usuario es responsable de la tarea (si no es tutor)
  if (userRole.roleName !== RoleEnum.TUTOR) {
    if (task.taskUserId !== userLoguedId) {
      throw new ForbiddenAccessError("No tiene permiso para adjuntar archivos a esta tarea");
    }
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






export async function getAttachmentStream(userLoguedId: string, attachmentId: string) {
  
  const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

 
  
  
  const attachment = await Attachment.findByPk(attachmentId);
  if (!attachment) {
    throw new ForbiddenAccessError('Archivo no encontrado');
  }


   // 🔒 Verificar si el usuario es responsable de la tarea (si no es tutor)
  if (userRole.roleName !== RoleEnum.TUTOR) {
    const task = await attachment.getTask();
    if (task.taskUserId !== userLoguedId) {
      throw new ForbiddenAccessError("No tiene permiso para descargar archivos");
    }
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


export async function lowAttachment(userLoguedId: string, attachmentId: string): Promise<void> {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

  // 1. Buscar el adjunto con info del usuario
  const attachment = await Attachment.findOne({
    where: { attachmentId: attachmentId,
      //attachmentUserId: userLoguedId
    },
    // include: [
    //   {
    //     association: "User", // o el alias definido en tu modelo
    //     attributes: ["userId"]
    //   }
    // ]
  });

  if (!attachment) {
    throw new ForbiddenAccessError("El archivo adjunto no existe");
  }

  // 2. Verificar si el usuario logueado es el propietario
  if (attachment.attachmentUserId !== userLoguedId) {
    throw new ForbiddenAccessError("No tienes permiso para eliminar este archivo");
  }

  // 3. Eliminar de Cloudinary si tiene ID registrado
  if (attachment.attachmentId) {
    try {
      await cloudinary.uploader.destroy(attachment.attachmentId);
    } catch (error) {
      console.error("Error al eliminar archivo en Cloudinary:", error);
      // Podés lanzar error si querés que falle todo, o seguir.
    }
  }

  // 4. Eliminar de la base de datos
  await Attachment.destroy({
    where: { attachmentId }
  });
}

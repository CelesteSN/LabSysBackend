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
import { ForbiddenAccessError , NotFoundResultsError} from '../../../errors/customUserErrors'; ;
import { v2 as cloudinary } from "cloudinary";
import { TaskStatus } from "../models/taskStatus.model";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import { StageStatus } from "../models/stageStatus.model";
import { StageStatusEnum } from "../../projects/enums/stageStatus.enum";
import { ProjectStatusEnum } from "../../projects/enums/projectStatus.enum";
import ProjectUser from "../models/projectUser.model";
import { Role } from "../models/role.model";
import path from 'path';




// export async function listAttachmentsByProject(
//   userLoguedId: string,
//   projectId: string,
//   filters: AttachmentFilter
// ): Promise<ProjectAttachmentDto | null> {

//   const userValidated = await validateActiveUser(userLoguedId);
//   const userRole = await userValidated.getRole();

//   // Si no es tutor, validar que pertenezca al proyecto
//   if (userRole.roleName !== RoleEnum.TUTOR) {
//     await validateProjectMembership(userLoguedId, projectId);
//   }

//   // Filtro de búsqueda: buscar por nombre del archivo, del propietario  y nombre de tarea
//   const whereSearch: any[] = [];
//   if (filters.search) {
//     const searchTerm = `%${filters.search}%`;
//     whereSearch.push(
//       { '$User.userFirstName$': { [Op.iLike]: searchTerm } },
//       { '$User.userLastName$': { [Op.iLike]: searchTerm } },
//       { '$Task.taskTitle$': { [Op.iLike]: searchTerm } }
//     );
//   }

//   const attachmentList = await Attachment.findAll({
//     attributes: ["attachmentId", "createdDate", "attachmentFileName"],
//     where: whereSearch.length ? { [Op.or]: whereSearch } : undefined,
//     include: [
//       {
//         model: User,
//         attributes: ["userFirstName", "userLastName"]
//       },
//       {
//         model: Task,
//         required: true,
//         attributes: ["taskTitle"],
//         include: [{
//           model: Stage,
//           required: true,
//           include: [{
//             model: Project,
//             required: true,
//             where: { projectId },
//             attributes: ["projectId"],
//             include: [{
//               model: ProjectStatus,
//               attributes: ["projectStatusName"]
//             }]
//           }]
//         }]
//       }
//     ],
//     order: [['createdDate', 'ASC']],
//     // Paginación opcional:
//     limit: parseInt(appConfig.ROWS_PER_PAGE),
//     offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
//   });

//   if (attachmentList.length === 0) return null;
//   const result = await mapAttachmentsToProjectDto(attachmentList);
//     return result

// }




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

  // Filtro de búsqueda: nombre archivo, usuario o tarea
  const whereSearch: any[] = [];
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    whereSearch.push(
      { '$User.userFirstName$': { [Op.iLike]: searchTerm } },
      { '$User.userLastName$': { [Op.iLike]: searchTerm } },
      { '$Task.taskTitle$': { [Op.iLike]: searchTerm } }
    );
  }

  // Si no es tutor, filtrar archivos propios o del tutor global
  let visibilityFilter: any = {};
  if (userRole.roleName !== RoleEnum.TUTOR) {
    // Obtener tutor global (se asume único en la base)
    const tutor = await User.findOne({
      include: [{ model: Role, where: { roleName: RoleEnum.TUTOR } }]
    });

    if (!tutor) {
      throw new Error('No se encontró el usuario con rol TUTOR.');
    }

    visibilityFilter = {
      [Op.or]: [
        { attachmentUserId: userLoguedId },
        { attachmentUserId: tutor.userId }
      ]
    };
  }

  const attachmentList = await Attachment.findAll({
    attributes: ["attachmentId", "createdDate", "attachmentFileName"],
    where: {
      ...(whereSearch.length ? { [Op.or]: whereSearch } : {}),
      ...(userRole.roleName !== RoleEnum.TUTOR ? visibilityFilter : {})
    },
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
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  });

  if (attachmentList.length === 0) return null;
  const result = await mapAttachmentsToProjectDto(attachmentList);
  return result;
}




export async function uploadTaskAttachment(
  taskId: string,
  userLoguedId: string,
  file: Express.Multer.File,
  description?: string
) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!file) {
    throw new ForbiddenAccessError("No se subió ningún archivo");
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ForbiddenAccessError("Tipo de archivo no permitido. Solo se permiten: jpg, png, pdf, txt, docx, doc");
  }

  const task = await Task.findOne({
    where: { taskId },
    include: [
      {
        model: TaskStatus,
        where: { taskStatusName:{ 
          [Op.or]:[TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING, TaskStatusEnum.DELAYED] }}
      },
      {
        model: Stage,
        include: [
          {
            model: StageStatus,
            where: {stageStatusName:{
                        [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING]
                      }
                    }
          },
          {
            model: Project,
            include: [
              {
                model: ProjectStatus,
                where: { projectStatusName:{
                  [Op.or]:[ ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]} }
              }
            ]
          }
        ]
      }
    ]
  });

  if (!task) {
    throw new ForbiddenAccessError("No puede adjuntar archivos a esta tarea");
  }

  if (userRole.roleName !== RoleEnum.TUTOR && task.taskUserId !== userLoguedId) {
    throw new ForbiddenAccessError("No tiene permiso para adjuntar archivos a esta tarea");
  }

  const attachment = await Attachment.create({
    attachmentFileName: file.originalname,
    attachmentFileLink: file.path, // URL pública del archivo
    attachmentCloudinaryId: file.filename, // ✅ Agregado: ID de Cloudinary
    attachmentDescription: description || null,
    attachmentMimeType: file.mimetype,
    createdDate: new Date(),
    updatedDate: new Date(),
    attachmentTaskId: taskId,
    attachmentUserId: userLoguedId
  });

  return attachment;
}



 
  




// export async function buildAttachmentDownloadUrl(attachmentId: string, userLoguedId: string): Promise<string> {
//   const attachment = await Attachment.findByPk(attachmentId, {
//     include: [
//       {
//         model: User,
//         attributes: ['userId'],
//         include: [{ model: Role, attributes: ['roleName'] }]
//       }
//     ]
//   });

//   if (!attachment) throw new NotFoundResultsError();

//   const ownerId = attachment.User?.userId;
//   if (!ownerId) throw new ForbiddenAccessError("Archivo sin propietario válido");

//   if (ownerId !== userLoguedId) {
//     const user = await User.findByPk(userLoguedId, {
//       include: [{ model: Role }]
//     });
//     const userRole = user?.Role?.roleName;

//     if (userRole !== RoleEnum.TUTOR) {
//       throw new ForbiddenAccessError("No tiene permiso para acceder a este archivo.");
//     }
//   }

//   // Construcción de la URL de descarga Cloudinary con nombre
//   const cloudinaryBaseUrl = 'https://res.cloudinary.com/dhjazdw9x/raw/upload';
//   const fileName = encodeURIComponent(attachment.attachmentFileName); // incluye extensión
//   const fileId = path.basename(attachment.attachmentFileLink); // ejemplo: tgfoenqacmgyghfnlsoh

//   return `${cloudinaryBaseUrl}/fl_attachment:${fileName}/labsys_uploads/${fileId}`;
// }




export async function getAttachmentUrl(userLoguedId: string, attachmentId: string) {
  
  const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();
  
  const attachment = await Attachment.findByPk(attachmentId);
  if (!attachment) {
    throw new ForbiddenAccessError("Archivo no encontrado");
  }

  if (userRole.roleName !== RoleEnum.TUTOR) {
    const task = await attachment.getTask();
    if (task.taskUserId !== userLoguedId) {
      throw new ForbiddenAccessError("No tiene permiso para acceder a este archivo");
    }
  }

  return attachment.attachmentFileLink;
}



export async function lowAttachment(
  userLoguedId: string,
  attachmentId: string,
  force = false
): Promise<void> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  const attachment = await Attachment.findOne({
    where: { attachmentId }
  });

  if (!attachment) {
    throw new ForbiddenAccessError("El archivo adjunto no existe");
  }

  // Solo verificar dueño si no viene forzado desde otra función
  if (!force && attachment.attachmentUserId !== userLoguedId) {
    throw new ForbiddenAccessError("No tienes permiso para eliminar este archivo");
  }

  if (attachment.attachmentCloudinaryId) {
    try {
      await cloudinary.uploader.destroy(attachment.attachmentCloudinaryId, {
        resource_type: "raw"
      });
    } catch (error) {
      console.error("Error al eliminar archivo en Cloudinary:", error);
    }
  }

  await Attachment.destroy({ where: { attachmentId } });
}

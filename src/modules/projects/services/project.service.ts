//import { add } from "winston";
import { Project } from "../models/project.model";
import bcrypt from "bcrypt";
import { ProjectStatus } from "../models/projectStatus.model";
import { ProjectStatusEnum } from "../enums/projectStatus.enum";
import { ProjectTypeEnum } from "../enums/projectType.enum";
import { ProjectType } from "../models/projectType.model";
import { randomUUID } from "crypto";
import { User } from "../models/user.model"
import { ForbiddenAccessError, UserNotFoundError, NameUsedError, NotFoundResultsError, StatusNotFoundError, OrderExistsError, NotValidDatesError, StageStatusNotFound, ProjectWithoutStagesError, NotFoundStagesError, NotFoundProjectError, BadRequestStartDateStageError, BadRequestEndDateStageError } from "../../../errors/customUserErrors";
import { RoleEnum } from "../../users/enums/role.enum";
import { Op } from "sequelize";
import { ProjectFilter } from "../dtos/projectFilters.dto";
import { AllProjectsDto, mapProjectToDto } from "../dtos/allProjects.dto";
import { appConfig } from "../../../config/app";
import { mapOneProjectToDto, OneProjectDto } from "../dtos/oneProjectResponse.dto";
import ProjectUser from "../models/projectUser.model";
import { Role } from "../models/role.model";
import Stage from "../models/stage.model";
import { StageStatus } from "../models/stageStatus.model";
import { AllStagesDto, mapStageToDto, ProjectDetailsDto } from "../dtos/allStages.dto";
import { StageStatusEnum } from "../enums/stageStatus.enum";
import { mapProjectToDetailsDto } from "../dtos/listMembers.dto";
import { parse } from 'date-fns';
import { UserStatus } from "../models/userStatus.model";
import { UserStatusEnum } from "../../users/enums/userStatus.enum";
import { AllUsersDto, mapUserToDto } from "../dtos/userList.dto";
import { renderTemplate, sendEmail } from '../../notifications/services/notification.service';
import { mapOneStageToDto, OneStageDto } from "../dtos/oneStage.dto";
import { Task } from "../models/task.model";
import { TaskStatus } from "../models/taskStatus.model";
import { TaskFilter } from "../dtos/taskFilters.dto";
import { mapTasksToProjectDetailsDto, ProjectDetails1Dto } from "../dtos/allTask.dto";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import { StageFilter } from "../dtos/stageFilters.dto";
import { Comment } from "../models/comment.model"
import { NotificationTemplate } from "../../notifications/models/notificationTemplate.model";
import { NotificationEmail } from "../../notifications/models/notificationEmail.model";




export async function listProjects(userLoguedId: string, filters: ProjectFilter): Promise<AllProjectsDto[]> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  const whereConditions: any = {};

  const statusRaw = filters?.status?.trim();
  const status = statusRaw ?? ProjectStatusEnum.INPROGRESS;
  const isStatusAll = status.toLowerCase() === ProjectStatusEnum.ALL.toLowerCase();

  if (filters?.search) {
    whereConditions[Op.or] = [
      { projectName: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  // Configuración base del query
  const baseQuery: any = {
    where: whereConditions,
    attributes: ['projectId', 'projectName', 'projectStartDate', 'projectEndDate', 'createdDate'],
    include: [],
    order: [["createdDate", "DESC"]],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  };

  // Filtro por estado del proyecto
  const statusInclude = {
    model: ProjectStatus,
    attributes: ['projectStatusName'],
    ...(isStatusAll ? {} : { where: { projectStatusName: status } })
  };

  // Condicional por rol
  if (userRole.roleName === RoleEnum.TUTOR) {
    baseQuery.include.push(statusInclude);
  } else if (RoleEnum.BECARIO === userRole.roleName || userRole.roleName === RoleEnum.PASANTE) {
    baseQuery.include.push(
      {
        model: ProjectUser,
        as: "projectUsers",
        where: {
          projectUserUserId: userValidated.userId
        }
      },
      statusInclude
    );
  }

  const projects = await Project.findAll(baseQuery);
  return projects.map(mapProjectToDto);
}



export async function saveNewProject(userLoguedId: string, projectName: string, projectTypeId: string, startDate: string, endDate: string): Promise<Project> {

  //llamar a la funcion para validar al usuario Activo
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();
  if (!(userRole.roleName == RoleEnum.TUTOR)) { throw new ForbiddenAccessError(); }

  //Valido que el nombre ingresado no exista
  const projectExists = await Project.findOne({
    where: {
      projectName: projectName
    },
  });
  if (projectExists) { throw new NameUsedError() };

  //obtengo el tipo de proyecto ingresado
  const type = await ProjectType.findByPk(projectTypeId);
  if (!type) { throw new StatusNotFoundError(); }

  //obtengo el estado activo
  let status = await ProjectStatus.findOne({
    where: {
      "projectStatusName": ProjectStatusEnum.ACTIVE
    }
  });

  if (!status) {
    throw new StatusNotFoundError();
  }

  //creo el proyecto
  const newProject = await Project.build();
    newProject.projectName = projectName,
    newProject.projectStartDate = parse(startDate, 'dd-MM-yyyy', new Date()),
    newProject.projectEndDate = parse(endDate, 'dd-MM-yyyy', new Date()),
    newProject.createdDate = new Date(),
    newProject.updatedDate = new Date(),
    newProject.projectStatusId = status.projectStatusId
    newProject.projectTypeId = type.projectTypeId;

  await newProject.save()
  return newProject;
}



export async function getProject(userLoguedId: string, projedId: string): Promise<OneProjectDto> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(await validateProjectMembershipWhitReturn(userValidated.userId, projedId) || userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }

  //Busco el proyecto para id seleccionado
  const project = await Project.findByPk(projedId, {

    include: [
      {
        model: ProjectStatus,
        attributes: ['projectStatusName']
      },
      {
        model: ProjectType,
        attributes: ['projectTypeName']
      }
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();

  }
  return mapOneProjectToDto(project);
}



export async function validateProjectMembershipWhitReturn(userId: string, projectId: string): Promise<boolean> {
  const membership = await ProjectUser.findOne({
    where: {
      projectUserUserId: userId,
      projectUserProjectId: projectId
    }
  });
  return !!membership; // retorna true si existe, false si no
}



export async function modifyProject(userLoguedId: string, projectId: string, name: string, startDate: string, endDate: string, description?: string, objetive?: string,): Promise<Project | null> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  //Debe ser Becario o Pasante
  if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError()
  }

  //Validar que el usuario este asignado al proyecto
  await validateProjectMembership(userLoguedId, projectId);

  //Valido que el nombre ingresado no exista
  const projecNametExists = await Project.findOne({
    where: {
      projectName: name,
      projectId: { [Op.ne]: projectId }
    },
  });
  if (projecNametExists) { throw new NameUsedError() };

  //Debe estar en estado "Activo" o "En progreso"
  const updatedProject = await Project.findOne({
    where: { "projectId": projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
          }
        },
      },
    ]
  });
  if (!updatedProject) {
    throw new NotFoundResultsError();
  }

  updatedProject.projectName = name;
  if (description != null) {
    updatedProject.projectDescription = description;
  };
  if (objetive != null) {
    updatedProject.projectObjetive = objetive;
  }
  updatedProject.updatedDate = new Date();
  updatedProject.projectStartDate = parse(startDate, 'dd-MM-yyyy', new Date()),
  updatedProject.projectEndDate = parse(endDate, 'dd-MM-yyyy', new Date()),

  await updatedProject.save(); // Guardar los cambios en la base de datos

  return updatedProject;
}



export function validateProjectDates(startDate: string, endDate: string): void {
  // Espera formato "dd-MM-yyyy"
  const [startDay, startMonth, startYear] = startDate.split("-");
  const [endDay, endMonth, endYear] = endDate.split("-");

  const parsedStartDate = new Date(`${startYear}-${startMonth}-${startDay}`);
  const parsedEndDate = new Date(`${endYear}-${endMonth}-${endDay}`);

  if (parsedEndDate < parsedStartDate) {
    throw new NotValidDatesError();
  }
}



export async function lowproject(userLoguedId: string, projectId: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    throw new ForbiddenAccessError();
  }

  const deletedproject = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
          }
        }
      }
    ]
  });

  if (!deletedproject) {
    throw new NotFoundResultsError();
  }

  // 🔍 Buscar el estado "Dado de baja" del proyecto, etapa y tarea
  const statusProjectLow = await ProjectStatus.findOne({
    where: { projectStatusName: ProjectStatusEnum.LOW }
  });

  if (!statusProjectLow) {
    throw new StatusNotFoundError();
  }

const statusStageLow = await StageStatus.findOne({
    where: { stageStatusName: StageStatusEnum.LOW }
  });

  if (!statusStageLow) {
    throw new StatusNotFoundError();
  }

const statusTaskLow = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.LOW }
  });

  if (!statusTaskLow) {
    throw new StatusNotFoundError();
  }


  // 🔁 Etapas del proyecto
  const deleteStageList = await Stage.findAll({
    where: { stageProjectId: projectId }
  });

  if (deleteStageList.length > 0) {
    for (const stage of deleteStageList) {
      // Marcar etapa como "Dado de baja"
      await Stage.update(
        {
          stageStatusId: statusStageLow.stageStatusId,
          deletedDate: new Date()
        },
        {
          where: { stageId: stage.stageId }
        }
      );

      // 🔁 Tareas de la etapa
      const deleteTaskList = await Task.findAll({
        where: { taskStageId: stage.stageId }
      });

      for (const task of deleteTaskList) {
        await Task.update(
          {
            taskStatusId: statusTaskLow.taskStatusId,
            deletedDate: new Date()
          },
          {
            where: { taskId: task.taskId }
          }
        );
      }
    }
  }

  // 🧨 Marcar el proyecto como "Dado de baja"
  deletedproject.setProjectStatus(statusProjectLow.projectStatusId);
  deletedproject.deletedDate = new Date();
  await deletedproject.save();

  return;
}


export async function listMembers(userLoguedId: string, projectId: string) {
  const userValidated = await validateActiveUser(userLoguedId);

  const userRole = await userValidated.getRole();

  // Si no es tutor, verificar que esté asociado al proyecto
  if (userRole.roleName !== RoleEnum.TUTOR) {
    await validateProjectMembership(userLoguedId, projectId);
  }

  const project = await Project.findOne({
    where: {
      projectId: projectId,
    },
    include: [
      {
        model: ProjectStatus,
        attributes: ['projectStatusName'],
        required: true
      },
      {
        model: ProjectUser,
        as: 'projectUsers', // alias que usaste en Project.hasMany(ProjectUser)
        include: [
          {
            model: User,
            attributes: ['userId', 'userFirstName', 'userLastName', 'userPersonalFile', 'userEmail'],
            include: [
              {
                model: Role,
                attributes: ['roleName'],
                required: true
              }
            ]
          }
        ]
      }
    ],
    order: [[{ model: ProjectUser, as: 'projectUsers' }, User, 'userFirstName', 'ASC']],

  });


  if (!project) {
    throw new NotFoundResultsError();
  }


  const result = mapProjectToDetailsDto(project);
  return result

};



export async function addMenmbers(userLoguedId: string, projectId: string, userIds: string[]) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    throw new ForbiddenAccessError();
  }

  // Validar existencia del proyecto y su estado
  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
          }
        },
      },
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();
  }


  // Validar que los usuarios existan y estén activos
  //   for (const userId of userIds) {
  //   const user = await User.findByPk(userId, {
  //     include: [{ model: UserStatus }]
  //   });

  //   if (!user) {
  //     throw new ForbiddenAccessError(`El usuario con ID "${userId}" no existe.`);
  //   }

  //   if (user.UserStatus.userStatusName !== UserStatusEnum.ACTIVE) {
  //     const fullName = `${user.userFirstName} ${user.userLastName}`;
  //     throw new ForbiddenAccessError(`El usuario "${fullName}" no está activo.`);
  //   }
  // }


  //   //Validar si pertenecen al proyecto 
  // for (const userId of userIds) {
  //   const existingMembership = await ProjectUser.findOne({
  //     where: {
  //       projectUserProjectId: projectId,
  //       projectUserUserId: userId
  //     },
  //     include: [{ model: User }] // asegurate que la asociación esté definida así
  //   });

  //   if (existingMembership) {
  //     const userFirstName = existingMembership.User?.userFirstName || 'El usuario';
  //     const userLastName = existingMembership.User?.userLastName || 'El usuario';
  //     throw new ForbiddenAccessError(`El usuario "${userFirstName} ${userLastName}" ya se encuentra asignado al proyecto, corrija su selección para continuar.`);
  //   }

  // }

  // Crear asociaciones
  const projectUsersToCreate = userIds.map(userId => ({
    projectUserProjectId: project.projectId,
    projectUserUserId: userId,
    createdDate: new Date(),
    updatedDate: new Date()
  }));

  // Guardar en DB
  await ProjectUser.bulkCreate(projectUsersToCreate);



   // Obtener plantilla de asignación a proyecto
              const template = await NotificationTemplate.findOne({
                where: { notificationTemplateName: "PROJECT_ASSIGNMENT" }
              });
            
              if (!template) {
                throw new Error("Plantilla de recuperación de contraseña no encontrada");
              }
  //  // Enviar emails a los usuarios
  for (const userId of userIds) {

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ForbiddenAccessError(`El usuario con ID "${userId}" no existe.`);
    } 
               
              // Construir el cuerpo con reemplazos
             // const recoveryLink = `https://tu-app.com/reset-password/${token}`;
             const html = await renderTemplate(template.notificationTemplateDescription, {
  userFirstName: user.userFirstName,
  userLastName: user.userLastName,
  projectName: project.projectName
});
                 await sendEmail(user.userEmail, template.notificationTemplateEmailSubject, html);
            
              // Crear notificación de email
              await NotificationEmail.create({
                notificationEmailUserId: userId,
                notificationEmailNotTemplateId: template.notificationTemplateId,
                //emailTo: user.userEmail,
                //emailStatus: "PENDING",
                createdDate: new Date(),
                //emailSubject: template.emailSubject,
                //emailHtml: html // campo opcional si querés guardar el cuerpo ya procesado
              });
    
    // const html = `
    //   <p>Estimado/a ${user.userFirstName} ${user.userLastName},</p>
    //   <p>Le informamos que ha sido asignado al proyecto <strong>${project.projectName}</strong>.</p>
    //   <p>Para visualizar los detalles del proyecto, ingrese al sistema a través del siguiente botón: “Iniciar sesión”.</p>
    //   <p>Saludos.</p>
    // `;

    // try {
    //   await sendEmail(user.userEmail, 'Asignación a proyecto', html);
    // } catch (err) {
    //   console.error(`Error al enviar email a ${user.userEmail}:`, err);
    //   // Podés registrar el error pero continuar con el resto
    // }
  }

  return;
}





export async function lowMember(userLoguedId: string, projectId: string, userId: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    throw new ForbiddenAccessError();
  }

  const memberValidated = await validateActiveUser(userId);

  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
          }
        }
      }
    ]
  });

  if (!project) throw new NotFoundResultsError();

  // 🔍 Obtener etapas del proyecto
  const projectStages = await Stage.findAll({
    where: { stageProjectId: projectId },
    attributes: ['stageId']
  });

  const stageIds = projectStages.map(stage => stage.stageId);

  // 🔁 Buscar tareas del usuario en esas etapas
  const tasksToDelete = await Task.findAll({
    where: {
      taskUserId: userId,
      taskStageId: {
        [Op.in]: stageIds
      }
    }
  });

  // 🗑 Eliminar comentarios y luego tareas
  for (const task of tasksToDelete) {
    await Comment.destroy({ where: { commentTaskId: task.taskId } }); // 🔁 Eliminar comentarios
    await task.destroy(); // 🔁 Eliminar tarea
  }

  // ❌ Eliminar la relación del usuario con el proyecto
  const oneProjectUser = await ProjectUser.findOne({
    where: {
      projectUserProjectId: projectId,
      projectUserUserId: userId
    }
  });

  if (!oneProjectUser) throw new NotFoundResultsError();

  await oneProjectUser.destroy();

  // 🔁 Recalcular fechas de todas las etapas
  for (const stage of projectStages) {
    await updateStageDates(stage.stageId);
    // También podrías llamar a updateStageProgress(stage.stageId);
  }

  return;
}


export async function listStages(
  userLoguedId: string,
  projectId: string,
  filters: StageFilter
): Promise<ProjectDetailsDto | null> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    await validateProjectMembership(userLoguedId, projectId);
  }

  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        // where: {
        //   projectStatusName: {
        //     [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
        //   }
        // },
      },
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();
  }

  const whereConditions: any = {
    stageProjectId: project.projectId
  };

  // Filtro por nombre de etapa (usando "search")
  if (filters?.search) {
    whereConditions.stageName = { [Op.iLike]: `%${filters.search}%` };
  }

  // Filtro por estado
  const stageStatusInclude: any = {
    model: StageStatus,
    attributes: ["stageStatusName"]
  };

  if (filters?.status) {
    stageStatusInclude.where = {
      stageStatusName: filters.status
    };
  }

  const stageList = await Stage.findAll({
    where: whereConditions,
    include: [
      stageStatusInclude,
      {
        model: Project,
        attributes: ["projectId"],
        include: [
          {
            model: ProjectStatus,
            attributes: ['projectStatusName'],
          }
        ]
      }
    ],
    order: [["stageOrder", "ASC"]],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  });

  if (stageList.length === 0) {
    return null;
  }

  const result = mapStageToDto(stageList);
  return result;
}




export async function getOneStage(userLoguedId: string, stageId: string): Promise<OneStageDto> {
  const userValidated = await validateActiveUser(userLoguedId);

  const stage = await Stage.findOne({
    where: {
      stageId: stageId,
    },
    include: [
      {
        model: StageStatus,
        attributes: ["stageStatusName"]
      },
      {
        model: Project,
        attributes: ["projectId"],
        include: [
          {
            model: ProjectStatus,
            attributes: ['projectStatusName'],
          }
        ]
      }
    ],
  });

  if (!stage) {
    throw new NotFoundResultsError();
  }
  const result = mapOneStageToDto(stage)
  return result
}



export async function addNewStage(userLoguedId: string, projectId: string, stageName: string, stageOrder: number) {
  //llamar a la funcion para validar al usuario Activo
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();
  if (!(userRole.roleName == RoleEnum.BECARIO || userRole.roleName == RoleEnum.PASANTE)) { throw new ForbiddenAccessError(); }

  //Valido si es miembro
  await validateProjectMembership(userLoguedId, projectId);

  //Valido el proyecto ingresado: solo se pueden agregar etapas mientras en proyecto este activo
  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
          }
        }
      }]

  });

  if (!project) {
    throw new NotFoundProjectError();
  }

    //Valido que el nombre ingresado no exista
  const stageExists = await Stage.findOne({
    where: {
      stageName: stageName,
      stageProjectId : projectId
    },
  });
  if (stageExists) { throw new NameUsedError() };

  //valido el orden
  const orderExist = await Stage.findOne({
    where: {
      stageOrder: stageOrder,
      stageProjectId: projectId
    }
  })
  if (orderExist) { throw new OrderExistsError() };

  //obtengo el estado pendiente
  let status = await StageStatus.findOne({
    where: {
      stageStatusName: StageStatusEnum.PENDING
    }
  });
  // console.log(status?.userStatusName)
  if (!status) {
    throw new StatusNotFoundError();

  }

  //creo la etapa
  const newStage = await Stage.build();
  newStage.stageName = stageName,
    newStage.stageOrder = stageOrder,
    newStage.createdDate = new Date(),
    newStage.updatedDate = new Date(),
    newStage.stageStatusId = status.stageStatusId,
    newStage.stageProjectId = project.projectId

  await newStage.save()
  return newStage;
}


//Función para validar si existe el usuario y si esta en estado activo

export async function validateActiveUser(userId: string): Promise<User> {

  const user = await User.findByPk(userId);
  if (!user) throw new UserNotFoundError();

  const userStatus = await user.getUserStatus();
  if (userStatus.userStatusName !== UserStatusEnum.ACTIVE) {
    // throw Errors.forbiddenAccessError("El usuario no está activo");
    throw new ForbiddenAccessError();
  }

  return user;
}



//Funcion para validar si un usuario es miembro de un proyecto
export async function validateProjectMembership(userId: string, projectId: string): Promise<void> {
  const isMember = await ProjectUser.findOne({
    where: {
      projectUserProjectId: projectId,
      projectUserUserId: userId
    }
  });

  if (!isMember) {
    throw new ForbiddenAccessError("No tiene permiso para realizar esta acción en el proyecto.");
  }
}



export async function modifyStage(userLoguedId: string, stageId: string, stageName: string, stageOrder: number): Promise<Stage | null> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError()
  }

  //Obtener el proyecto a partir de la etapa
  //Valido el proyecto ingresado
  const stageUpdated = await Stage.findOne({
    where: { "stageId": stageId },
    include: [
      {
        model: StageStatus,
        where: {
          stageStatusName: {
            [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING]
          }
        },
      },
    ]
  });

  if (!stageUpdated) {
    throw new NotFoundResultsError();
  }

  const pro = await stageUpdated.getProject();
  //Validar que este asignado al proyecto
  await validateProjectMembership(userLoguedId, pro.projectId);


  //Valido que el nombre ingresado no exista
  const stageNameExists = await Stage.findOne({
    where: {
      stageName: stageName,
      stageProjectId: pro.projectId,
      stageId: { [Op.ne]: stageId } // excluye la etapa actual
    },
  });
  if (stageNameExists) { throw new NameUsedError() };


  //valido el orden
  const orderExist = await Stage.findOne({
    where: {
      stageOrder: stageOrder,
      stageProjectId: pro.projectId,
      stageId: { [Op.ne]: stageId } // excluye la etapa actual

    }
  })
  if (orderExist) { throw new OrderExistsError() };


  stageUpdated.stageName = stageName;
  stageUpdated.stageOrder = stageOrder;
  stageUpdated.updatedDate = new Date();


  await stageUpdated.save(); // Guardar los cambios en la base de datos

  return stageUpdated;
}



export async function lowStage(userLoguedId: string, stageId: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (![RoleEnum.BECARIO, RoleEnum.PASANTE].includes(userRole.roleName as RoleEnum)) {
    throw new ForbiddenAccessError();
  }

  const deletedStage = await Stage.findOne({
    where: { stageId },
    include: [
      {
        model: StageStatus,
        where: {
          stageStatusName: StageStatusEnum.PENDING
          }
      }
    ]
  });

  if (!deletedStage) {
    throw new NotFoundResultsError();
  }

  // Obtener el proyecto de la etapa
  const projectStage = await deletedStage.getProject();

  // Validar membresía
  await validateProjectMembership(userLoguedId, projectStage.projectId);

  // 🔍 Obtener tareas asociadas a la etapa
  const tasks = await Task.findAll({
    where: { taskStageId: deletedStage.stageId }
  });

  // 🔁 Eliminar comentarios y tareas una por una
  for (const task of tasks) {
    await Comment.destroy({
      where: { commentTaskId: task.taskId }
    });

    await task.destroy();
  }

  // 🗑 Eliminar la etapa
  await deletedStage.destroy();

  return;
}




export async function listProjectType(userLoguedId: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const projectType = await ProjectType.findAll();
  return projectType
}


export async function getAvailableUsersForProject(userLoguedId: string, projectId: string, pageNumber: number): Promise<AllUsersDto[]> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    //await validateProjectMembership(userLoguedId, projectId);
    throw new ForbiddenAccessError()
  }
  // Obtener IDs de usuarios ya asignados al proyecto
  const assignedUsers = await ProjectUser.findAll({
    where: { projectUserProjectId: projectId },
    attributes: ['projectUserUserId']
  });

  const assignedUserIds = assignedUsers.map(pu => pu.projectUserUserId);

  // Buscar usuarios activos con rol "BECARIO" o "PASANTE" que no estén asignados al proyecto
  const availableUsers = await User.findAll({
    where: {
      userId: { [Op.notIn]: assignedUserIds }
    },
    attributes: ['userId', 'userFirstName', 'userLastName'],
    include: [
      {
        model: Role,
        where: {
          roleName: { [Op.in]: [RoleEnum.BECARIO, RoleEnum.PASANTE] }
        }
      },
      {
        model: UserStatus,
        where: {
          userStatusName: UserStatusEnum.ACTIVE
        }
      }
    ],
    order: [["userFirstName", "ASC"]],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * pageNumber,
  });

  return availableUsers.map(mapUserToDto)
}



export async function listTask(userLoguedId: string, projectId: string, filters: TaskFilter): Promise<ProjectDetails1Dto | null> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();
  const isRestrictedRole = [RoleEnum.BECARIO, RoleEnum.PASANTE].includes(userRole.roleName as RoleEnum);
  if (isRestrictedRole) {
    await validateProjectMembership(userLoguedId, projectId);
  }

    const whereConditions: any = {};

  // Filtro por búsqueda
  if (filters?.search) {
    whereConditions[Op.or] = [
      { taskTitle: { [Op.iLike]: `%${filters.search}%` } }
    ];
  }

  // Filtro por prioridad
if (filters?.priority != null) {
  whereConditions.taskPriority = filters.priority;
}

  // Paso 1: Verificar si el proyecto tiene etapas
  const stages = await Stage.findAll({
    where: { stageProjectId: projectId },
    attributes: ['stageId']
  });

  if (stages.length === 0) {
    //throw new NotFoundStagesError();
    return null;
  }

  const taskList = await Task.findAll({
    where: whereConditions,
    attributes: ["taskId", "taskTitle", "taskOrder", "taskPriority", "taskStartDate", "taskEndDate"],
    include: [
      {
        model: TaskStatus,
        attributes: ["taskStatusName"],
        ...(filters?.status
          ? {
            where: {
              taskStatusName: {
                [Op.iLike]: `%${filters.status}%`
              }
            }
          }
          : {})
      },
      {
        model: User,
        attributes: ["userFirstName", "userLastName"],
        ...(isRestrictedRole
          ? {
            where: {
              userId: userLoguedId
            }
          }
          : {}),
      },
      {
        model: Stage,
        required: true, // Solo trae tareas que tienen Stage

        attributes: ["stageName", "stageOrder"],
        include: [
          {
            model: Project,
            where: { projectId },
            attributes: ["projectId", "projectName"],
            include: [
              {
                model: ProjectStatus,
                attributes: ["projectStatusName"]
              }
            ]
          }
        ]
      }
    ],
    order: [
      [Stage, 'stageOrder', 'ASC'],
      [Stage, 'stageName', 'ASC'],
      ['taskOrder', 'ASC']
    ],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  });

  // Verificaciones
  if (!taskList) throw new NotFoundResultsError();

  if (taskList.length === 0) return null;

  const allStagesAreNull = taskList.every(t => t.Stage === null);
  if (allStagesAreNull) {
    //throw new ProjectWithoutStagesError ();
    return null
  }
  const result = mapTasksToProjectDetailsDto(taskList);
  return result;
}





export function validateProjectStartDate(projectStartDate: string): void {
  const [dd, mm, yyyy] = projectStartDate.split("-").map(Number);

  if (!dd || !mm || !yyyy) {
    throw new ForbiddenAccessError("Fecha con formato inválido (esperado dd-mm-yyyy)");
  }

  const fechaInicio = new Date(yyyy, mm - 1, dd);
  fechaInicio.setHours(0, 0, 0, 0);

  if (isNaN(fechaInicio.getTime())) {
    throw new ForbiddenAccessError("Fecha inválida");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaInicio < hoy) {
    throw new ForbiddenAccessError("La fecha de inicio del proyecto no puede ser anterior a hoy");
  }
}




export async function updateStageDates(stageId: string): Promise<void> {
    // Obtener la etapa con su proyecto
    const stage = await Stage.findByPk(stageId, {
        include: [{
            model: Project,
            attributes: ["projectStartDate", "projectEndDate"]
        }]
    });

    if (!stage || !stage.Project) {
        throw new Error("No se encontró la etapa o el proyecto asociado.");
    }

    const projectStart = stage.Project.projectStartDate;
    const projectEnd = stage.Project.projectEndDate;

    // Obtener todas las tareas de la etapa
    const tasks = await Task.findAll({
        where: { taskStageId: stageId },
        attributes: ["taskStartDate", "taskEndDate"]
    });

    if (tasks.length === 0) {
        await Stage.update(
            {
                stageStartDate: null,
                stageEndDate: null
            },
            { where: { stageId } }
        );
        return;
    }

    // Obtener fechas mínimas y máximas
    const startDates = tasks.map(t => t.taskStartDate).filter(Boolean) as Date[];
    const endDates = tasks.map(t => t.taskEndDate).filter(Boolean) as Date[];

    const minStartDate = startDates.length ? new Date(Math.min(...startDates.map(d => d.getTime()))) : null;
    const maxEndDate = endDates.length ? new Date(Math.max(...endDates.map(d => d.getTime()))) : null;

    // Validar límites del proyecto
    if (minStartDate && projectStart && minStartDate < projectStart) {
        throw new BadRequestStartDateStageError();
    }

    if (maxEndDate && projectEnd && maxEndDate > projectEnd) {
        throw new BadRequestEndDateStageError();
    }

    // Actualizar etapa
    await Stage.update(
        {
            stageStartDate: minStartDate,
            stageEndDate: maxEndDate
        },
        { where: { stageId } }
    );
}

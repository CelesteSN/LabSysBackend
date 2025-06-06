
import { Task } from "../models/task.model";
import { TaskStatus } from "../models/taskStatus.model";
import { ProjectDetailsDto, mapTasksToProjectDetailsDto } from "../dtos/allTask.dto";
import { User } from "../models/user.model";
import Stage from "../models/stage.model";
import { UserStatusEnum } from "../enums/userStatus.enum";
import ProjectUser from "../models/projectUser.model";
import { EmailAlreadyExistsError, RoleNotFoundError, StatusNotFoundError, UserNotFoundError, ForbiddenError, ForbiddenAccessError, UserAlreadyDeletedError, NotFoundResultsError, NameUsedError, OrderExistsError, NotModifiOrDeleteCommentError, BadRequestStartDateStageError, BadRequestEndDateStageError, BadRequestError } from '../../../errors/customUserErrors';
import { parse, addDays, isBefore } from 'date-fns';
import { RoleEnum } from "../enums/role.enum";
import { Op } from "sequelize";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import { Project } from "../models/project.model";
import { ProjectStatus } from "../models/projectStatus.model";
import { ProjectStatusEnum } from "../../projects/enums/projectStatus.enum";
import { StageStatus } from "../models/stageStatus.model";
import { StageStatusEnum } from "../../projects/enums/stageStatus.enum";
import { mapOneTaskToDto, OneTaskDto } from "../dtos/oneTask.dto";
import { TaskFilter } from "../dtos/taskFilters.dto";
import { appConfig } from "../../../config/app";
import { Comment } from "../models/comment.model";
import { CommentType } from "../models/commentType.model";
import { AllCommentsDto, mapCommentToTaskDetailsDto, TaskDetailsDto } from "../dtos/allCommnet.dto";
import { CommentFilter } from "../dtos/commentFilter.dto";
import { mapOneCommentToDto } from "../dtos/oneComment.dto";
import { updateTask } from "../controllers/task.controller";
import { NotificationTemplate } from "../../notifications/models/notificationTemplate.model";
import { NotificationEmail } from "../../notifications/models/notificationEmail.model";
import { renderTemplate, sendEmail } from "../../notifications/services/notification.service";
import { Role } from "../models/role.model";
;








export async function addTask(userLoguedId: string, stageId: string, taskName: string, taskOrder: number, taskStartDate: string, taskEndDate: string, taskDescription?: string, priority?: number) {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();


  if (!(userRole.roleName == RoleEnum.BECARIO || userRole.roleName == RoleEnum.PASANTE)) { throw new ForbiddenAccessError(); }

  //Valido si es miembro y si la etapa esta en estado pendiente o en progreso
  const stage1 = await Stage.findOne({
    where: { stageId: stageId },
    include: [
      {
        model: StageStatus,
        where: {
          "stageStatusName": {
            [Op.or]: [StageStatusEnum.INPROGRESS,
            StageStatusEnum.PENDING]
          }
        }
      },
      {
        model: Project,
        include: [
          {
            model: ProjectStatus,
            where: {
              projectStatusName: {
                [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
              }
            },
            attributes: ["projectStatusName"]
          }
        ]
      }
    ],
  })
  if (!stage1) { throw new NotFoundResultsError(); }
  const pro = await stage1.getProject()
  //Validar que este asignado al proyecto
  await validateProjectMembership(userLoguedId, pro.projectId);


  //Valido que el nombre ingresado no exista
  const taskExists = await Task.findOne({
    where: {
      taskTitle: taskName,
      taskStageId: stageId
    },
  });
  if (taskExists) { throw new NameUsedError() };

  //valido el orden
  const orderExist = await Task.findOne({
    where: {
      taskOrder: Number(taskOrder),
      taskStageId: stageId
    }
  })
  if (orderExist) { throw new OrderExistsError() };

  //obtengo el estado pendiente para la nueva tarea
  let statusPending = await TaskStatus.findOne({
    where: {
      taskStatusName: TaskStatusEnum.PENDING
    }
  });
  // console.log(status?.userStatusName)
  if (!statusPending) {
    throw new StatusNotFoundError();
  }



  const newTask = Task.build(); // no hace falta el await, build no persiste

  newTask.taskTitle = taskName;
  newTask.taskDescription = taskDescription || null;
  newTask.taskOrder = Number(taskOrder);

  if (priority != null) {
    newTask.taskPriority = Number(priority);
  }

  newTask.createdDate = new Date();
  newTask.updatedDate = new Date();
  newTask.taskStartDate = parse(taskStartDate, 'dd-MM-yyyy', new Date());
  newTask.taskEndDate = parse(taskEndDate, 'dd-MM-yyyy', new Date());
  newTask.taskStageId = stage1.stageId;
  newTask.taskStatusId = statusPending.taskStatusId;
  newTask.taskUserId = userValidated.userId;


  await validateTaskDateWithinProjectLimits(
    newTask.taskStageId,
    newTask.taskStartDate,
    newTask.taskEndDate
  );

  await newTask.save();
  await updateStageProgress(newTask.taskStageId);
  await updateStageDates(newTask.taskStageId);

  return
}




//Funcion para validar antes de guardar si al agregar o editar una tarea se van a pasar los limites
export async function validateTaskDateWithinProjectLimits(
  taskStageId: string,
  newStartDate: Date,
  newEndDate: Date
): Promise<void> {
  // 1. Obtener todas las tareas existentes de la etapa
  const existingTasks = await Task.findAll({
    where: { taskStageId },
    attributes: ['taskStartDate', 'taskEndDate']
  });

  // 2. Simular fechas con la nueva tarea
  const simulatedDates = [
    ...existingTasks,
    { taskStartDate: newStartDate, taskEndDate: newEndDate }
  ];

  const startDates = simulatedDates.map(t => t.taskStartDate).filter(Boolean);
  const endDates = simulatedDates.map(t => t.taskEndDate).filter(Boolean);

  const minStart = new Date(Math.min(...startDates.map(d => new Date(d).getTime())));
  const maxEnd = new Date(Math.max(...endDates.map(d => new Date(d).getTime())));

  // 3. Obtener el proyecto asociado a la etapa
  const stage = await Stage.findByPk(taskStageId, {
    include: [{ model: Project }]
  });

  if (!stage || !stage.Project) {
    //throw new BadRequestError("No se pudo encontrar el proyecto asociado a la etapa.");
    throw new ForbiddenAccessError("No se pudo encontrar el proyecto asociado a la etapa.");
  }

  const projectStart = stage.Project.projectStartDate;
  const projectEnd = stage.Project.projectEndDate;

  // 4. Validar rango
  if (minStart < projectStart || maxEnd > projectEnd) {
    //throw new BadRequestError("La tarea extiende la etapa fuera del rango del proyecto.");
    throw new ForbiddenAccessError("La tarea extiende la etapa fuera del rango del proyecto.");

  }
}

//Función para actualizar las fechas
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


export async function updateOnlyStageDates(stageId: string): Promise<void> {
  // Obtener todas las tareas de la etapa
  const tasks = await Task.findAll({
    where: {
      taskStageId: stageId
    },
    attributes: ["taskStartDate", "taskEndDate"]
  });

  if (tasks.length === 0) {
    // Si no hay tareas, limpiar fechas
    await Stage.update(
      {
        stageStartDate: null,
        stageEndDate: null
      },
      {
        where: { stageId }
      }
    );
    return;
  }

  // Obtener fechas mínimas y máximas
  const startDates = tasks.map(t => t.taskStartDate).filter(Boolean) as Date[];
  const endDates = tasks.map(t => t.taskEndDate).filter(Boolean) as Date[];

  const minStartDate = startDates.length ? new Date(Math.min(...startDates.map(d => d.getTime()))) : null;
  const maxEndDate = endDates.length ? new Date(Math.max(...endDates.map(d => d.getTime()))) : null;

  // Actualizar etapa
  await Stage.update(
    {
      stageStartDate: minStartDate,
      stageEndDate: maxEndDate
    },
    {
      where: { stageId }
    }
  );
}

export async function getOneTask(userLoguedId: string, taskId: string): Promise<OneTaskDto> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  const isRestrictedRole = [RoleEnum.BECARIO, RoleEnum.PASANTE].includes(userRole.roleName as RoleEnum);


  const task = await Task.findOne({
    where: { taskId },
    include: [
      {
        model: TaskStatus,
        attributes: ["taskStatusName"]
      },
      {
        model: User,
        ...(isRestrictedRole
          ? {
            where: { userId: userLoguedId }
          }
          : {})
      },
      {
        model: Stage,
        attributes: ["stageName", "stageId"],
        include: [
          {
            model: StageStatus
            // No poner where si no se filtra
          },
          {
            model: Project,
            include: [
              {
                model: ProjectStatus
                // ❗ No dejar el where vacío ni comentado así
                // O directamente sacalo si no filtrás
              }
            ]
          }
        ]
      }
    ]
  });


  if (!task) { throw new NotFoundResultsError(); }
  const stageAux = await task.getStage();
  const pro = await stageAux.getProject()
  if (!(await validateProjectMembershipWhitReturn(userValidated.userId, pro.projectId) || userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }
  const result = mapOneTaskToDto(task)

  return result
}



export async function modifyTask(
  userLoguedId: string,
  taskId: string,
  taskName: string,
  taskOrder: number,
  taskStartDate: string,
  taskEndDate: string,
  taskStatus: string,
  taskDescription?: string,
  priority?: number
): Promise<Task | null> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName == RoleEnum.BECARIO || userRole.roleName == RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError();
  }

  const updatedTask = await Task.findOne({
    where: { taskId, taskUserId: userLoguedId },
    include: [
      {
        model: TaskStatus,
        attributes: ["taskStatusName"]
      },
      {
        model: User,
        where: { userId: userLoguedId }
      },
      {
        model: Stage,
        attributes: ["stageName"],
        include: [
          {
            model: StageStatus,
            where: {
              stageStatusName: {
                [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING]
              }
            }
          },
          {
            model: Project,
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
          }
        ]
      }
    ]
  });

  if (!updatedTask) throw new NotFoundResultsError();

  // 🚫 Bloquear modificación si la tarea ya está finalizada
  const currentTaskStatus = await updatedTask.getTaskStatus();
  if (currentTaskStatus.taskStatusName === TaskStatusEnum.FINISHED) {
    throw new ForbiddenAccessError("No se puede modificar una tarea finalizada");
  }

  const stageAux = await updatedTask.getStage();
  const proy = await stageAux.getProject();

  if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId))) {
    throw new ForbiddenAccessError();
  }

  const taskNameExists = await Task.findOne({
    where: {
      taskTitle: taskName,
      taskStageId: stageAux.stageId,
      taskId: { [Op.ne]: taskId }
    }
  });
  if (taskNameExists) throw new NameUsedError();

  const orderExist = await Task.findOne({
    where: {
      taskOrder,
      taskStageId: stageAux.stageId,
      taskId: { [Op.ne]: taskId }
    }
  });
  if (orderExist) throw new OrderExistsError();

  const validStatus = await TaskStatus.findOne({ where: { taskStatusId: taskStatus } });
  if (!validStatus) throw new StatusNotFoundError();

  const stageStatus = await stageAux.getStageStatus();
  const projectStatus = await proy.getProjectStatus();

  // Si una tarea pasa a EN PROGRESO
  if (validStatus.taskStatusName === TaskStatusEnum.INPROGRESS) {
    if (stageStatus.stageStatusName === StageStatusEnum.PENDING) {
      const inProgressStageStatus = await StageStatus.findOne({ where: { stageStatusName: StageStatusEnum.INPROGRESS } });
      if (inProgressStageStatus) await stageAux.setStageStatus(inProgressStageStatus);
    }
    if (projectStatus.projectStatusName === ProjectStatusEnum.ACTIVE) {
      const inProgressProjectStatus = await ProjectStatus.findOne({ where: { projectStatusName: ProjectStatusEnum.INPROGRESS } });
      if (inProgressProjectStatus) await proy.setProjectStatus(inProgressProjectStatus);
    }
  }

  

  const parsedStart = parse(taskStartDate, 'dd-MM-yyyy', new Date());
  const parsedEnd = parse(taskEndDate, 'dd-MM-yyyy', new Date());
  await validateTaskDateWithinProjectLimits(updatedTask.taskStageId, parsedStart, parsedEnd);

  updatedTask.taskTitle = taskName;
  updatedTask.taskOrder = taskOrder;
  updatedTask.taskStartDate = parsedStart;
  updatedTask.taskEndDate = parsedEnd;
  if (priority != null) updatedTask.taskPriority = Number(priority);
  updatedTask.taskDescription = taskDescription || null;
  updatedTask.taskStatusId =  await validStatus.taskStatusId;
  updatedTask.updatedDate = new Date();

  await updatedTask.save();
  await updateStageProgress(updatedTask.taskStageId);
  await updateStageDates(updatedTask.taskStageId);
// Si todas las tareas están finalizadas, cambiar a FINALIZADO
  const tasksOfStage = await Task.findAll({ where: { taskStageId: stageAux.stageId }, include: [TaskStatus] });
  const allFinished = tasksOfStage.every(t => t.TaskStatus?.taskStatusName === TaskStatusEnum.FINISHED);
  if (allFinished) {
    const finishedStageStatus = await StageStatus.findOne({ where: { stageStatusName: StageStatusEnum.FINISHED } });
    if (finishedStageStatus) await stageAux.setStageStatus(finishedStageStatus);

    const allStages = await Stage.findAll({ where: { stageProjectId: proy.projectId }, include: [StageStatus] });
    const allStagesFinished = allStages.every(s => s.StageStatus?.stageStatusName === StageStatusEnum.FINISHED);
    if (allStagesFinished) {
      const finishedProjectStatus = await ProjectStatus.findOne({ where: { projectStatusName: ProjectStatusEnum.FINISHED } });
      if (finishedProjectStatus) await proy.setProjectStatus(finishedProjectStatus);
    }
  }

  // ✅ Verificar si la etapa y el proyecto deben actualizar su estado a FINALIZADO
//await checkAndUpdateStageAndProjectStatusFromTask(updatedTask.taskId);
  return updatedTask;
}






//Por ahora no lo uso, esta dentro de modifyTask
export async function checkAndUpdateStageAndProjectStatusFromTask(taskId: string): Promise<void> {
  const task = await Task.findByPk(taskId, {
    include: [Stage]
  });

  if (!task || !task.Stage) return;

  const stage = task.Stage;

  // 🔍 Traer todas las tareas de la etapa manualmente
  const tasksOfStage = await Task.findAll({
    where: { taskStageId: stage.stageId },
    include: [TaskStatus]
  });

  const allTasksFinished = tasksOfStage.every(
    t => t.TaskStatus?.taskStatusName?.toUpperCase() === TaskStatusEnum.FINISHED
  );

  const stageProgressComplete = stage.stageProgress === 100;

  if ((allTasksFinished || stageProgressComplete)) {
    const currentStatus = await stage.getStageStatus();
    if (currentStatus?.stageStatusName !== StageStatusEnum.FINISHED) {
      const finishedStatus = await StageStatus.findOne({
        where: { stageStatusName: StageStatusEnum.FINISHED }
      });
      if (finishedStatus) await stage.setStageStatus(finishedStatus);
    }
  }

  // 🔍 Verificar si todo el proyecto debe finalizar
  const project = await stage.getProject();
  if (!project) return;

  const allStages = await Stage.findAll({
    where: { stageProjectId: project.projectId },
    include: [StageStatus]
  });

  const allStagesFinished = allStages.every(
    s => s.StageStatus?.stageStatusName === StageStatusEnum.FINISHED
  );

  if (allStagesFinished) {
    const projectStatus = await project.getProjectStatus();
    if (projectStatus?.projectStatusName !== ProjectStatusEnum.FINISHED) {
      const finishedProjectStatus = await ProjectStatus.findOne({
        where: { projectStatusName: ProjectStatusEnum.FINISHED }
      });
      if (finishedProjectStatus) await project.setProjectStatus(finishedProjectStatus);
    }
  }
}





export async function lowTask(userLoguedId: string, taskId: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (![RoleEnum.BECARIO, RoleEnum.PASANTE].includes(userRole.roleName as RoleEnum)) {
    throw new ForbiddenAccessError();
  }

  const deletedTask = await Task.findOne({
    where: {
      taskId,
      taskUserId: userLoguedId
    },
    include: [
      {
        model: TaskStatus,
        where: {
          taskStatusName: {
            [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING]
          }
        }
      }
    ]
  });

  if (!deletedTask) {
    throw new NotFoundResultsError();
  }

  // 🔍 Obtener la etapa y proyecto
  const taskStage = await deletedTask.getStage();
  if (!taskStage) throw new Error("La tarea no tiene etapa asociada.");

  const stageProject = await taskStage.getProject();
  if (!stageProject) throw new Error("La etapa no tiene proyecto asociado.");

  // 🔒 Validar que el usuario está asignado al proyecto
  await validateProjectMembership(userLoguedId, stageProject.projectId);

  // 🗑 Eliminar todos los comentarios asociados a la tarea
  await Comment.destroy({
    where: {
      commentTaskId: deletedTask.taskId
    }
  });

  // 🗑 Eliminar la tarea
  await deletedTask.destroy();

  // 🔁 Recalcular etapa
  await updateStageProgress(deletedTask.taskStageId);
  await updateOnlyStageDates(deletedTask.taskStageId);

  return;
}

// export async function lowTask(userLoguedId: string, taskId: string) {

//     const userValidated = await validateActiveUser(userLoguedId);
//     const userRole = await userValidated.getRole();

//     if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
//         throw new ForbiddenAccessError()
//     }

//     const deletedTask = await Task.findOne({
//         where: {
//             taskId: taskId,
//             taskUserId: userLoguedId
//         },
//         include: [
//             {
//                 model: TaskStatus,
//                 where: {
//                     taskStatusName: {
//                         [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING]
//                     }
//                 },
//             },
//         ]

//     });
//     if (!deletedTask) {
//         throw new NotFoundResultsError();
//     }

//     //Obtener el id de proyecto a partir de la etapa

//     const taskStage = await deletedTask.getStage();
//     const stageProject = await taskStage.getProject();

//     //Validar que este asignado al proyecto
//     await validateProjectMembership(userLoguedId, stageProject.projectId);
//  //Elimino todas las tareas asociadas
//     await Comment.destroy({
//     where:{
//     commentTaskId : deletedTask.taskId
// }
//   })
//     deletedTask.destroy();
//     await updateStageProgress(deletedTask.taskStageId);
//     await updateStageDates(deletedTask.taskStageId);
//     return
// }

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


export async function validateProjectMembershipWhitReturn(userId: string, projectId: string): Promise<boolean> {
  const membership = await ProjectUser.findOne({
    where: {
      projectUserUserId: userId,
      projectUserProjectId: projectId
    }
  });

  return !!membership; // retorna true si existe, false si no
}



export async function updateStageProgress(stageId: string): Promise<void> {
  // Traer todas las tareas de la etapa
  const tasks = await Task.findAll({
    where: { taskStageId: stageId },
    include: [
      {
        model: TaskStatus,
        attributes: ["taskStatusName"]
      }
    ]
  });

  if (tasks.length === 0) {
    await Stage.update({ stageProgress: 0 }, { where: { stageId } });
    return;
  }

  // Asignar peso según la prioridad: 0 = 1, 1 = 2, 2 = 3, 3 = 4
  const getPriorityWeight = (priority?: number | null): number => {
    if (priority == null) return 1;
    return priority + 1;
  };

  let totalWeight = 0;
  let completedWeight = 0;

  for (const task of tasks) {
    const weight = getPriorityWeight(task.taskPriority);
    totalWeight += weight;

    if (task.TaskStatus?.taskStatusName?.toUpperCase() === "FINALIZADA") {
      completedWeight += weight;
    }
  }

  const progress = Math.round((completedWeight / totalWeight) * 100);

  // Actualizar el progreso de la etapa
  await Stage.update({ stageProgress: progress }, { where: { stageId } });
}




export async function listComment(userLoguedId: string, taskId: string, filters: CommentFilter): Promise<TaskDetailsDto | null> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  const whereConditions: any = {};



  if (filters?.date) {
    const startDate = parse(filters.date, 'dd-MM-yyyy', new Date());
    const endDate = addDays(startDate, 1); // día siguiente a las 00:00

    whereConditions.createdDate = {
      [Op.gte]: startDate,
      [Op.lt]: endDate
    };
  }

  //Obtener la tarea y la valido
  const taskExist = await Task.findOne({
    where: { taskId: taskId },
    include: [{
      model: Stage,
      include: [{
        model: Project
      }]
    }],
  });
  if (!taskExist) { throw new NotFoundResultsError };


  const stageAux = await taskExist.getStage();
  const proy = await stageAux.getProject()


  if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId) || userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }

  //Obtengo el listado de comentarios asociados a la tarea
  const commentList = await Comment.findAll({
    where: whereConditions,
    attributes: ["commentId", "createdDate", "commentDetail"],
    include: [
      {
        model: CommentType,
        attributes: ["commentTypeName", "commentTypeId"]
      },
      {
        model: User,
        attributes: ["userFirstName", "userLastName"]
      },
      {
        model: Task,
        where: {
          taskId: taskId,
          //taskUserId: userLoguedId
        },
        attributes: ["taskId"],
        include: [{
          model: TaskStatus,
          attributes: ["taskStatusName"]

        }]
      }],
    order: [['createdDate', 'DESC']],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  });
  if (commentList.length == 0) { return null }
  const result = mapCommentToTaskDetailsDto(commentList)
  return result;
}


export async function addComment(userLoguedId: string, taskId: string, commentDetail: string, commentType: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  // Obtener la tarea sin filtrar por usuario
  const validatedTask = await Task.findOne({
    where: { taskId },
    include: [
      {
        model: TaskStatus,
        where: {
          taskStatusName: {
            [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING]
          }
        },
        attributes: ["taskStatusName"]
      },
      {
        model: User,
        attributes: ["userId"]
      },
      {
        model: Stage,
        attributes: ["stageName"],
        include: [
          {
            model: StageStatus,
            where: {
              stageStatusName: {
                [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING]
              }
            }
          },
          {
            model: Project,
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
          }
        ]
      }
    ]
  });

  if (!validatedTask) throw new ForbiddenAccessError("No se encontro la tarea o ya esta finalizada");

  // Validar si es TUTOR o responsable de la tarea
  const isOwner = validatedTask.taskUserId === userLoguedId;
  const isTutor = userRole.roleName === RoleEnum.TUTOR;

  if (!isTutor && !isOwner) {
    throw new ForbiddenAccessError();
  }

  // Validar relación con el proyecto
  const stageAux = await validatedTask.getStage();
  const proy = await stageAux.getProject();

  //   if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId))) {
  //     throw new ForbiddenAccessError();
  //   }

  // Validar tipo de comentario
  const commentTypeExists = await CommentType.findOne({
    where: { commentTypeId: commentType }
  });

  if (!commentTypeExists) {
    throw new StatusNotFoundError();
  }

  // Crear y guardar comentario
  const newComment = await Comment.create({
    commentDetail,
    commentTypeId: commentTypeExists.commentTypeId,
    commentTaskId: validatedTask.taskId,
    commentUserId: userValidated.userId,
    createdDate: new Date(),
    updatedDate: new Date()
  });


  //envío de email



  // Obtener plantilla
const template = await NotificationTemplate.findOne({
  where: { notificationTemplateName: "NEW_COMMENT" }
});
if (!template) throw new Error("Plantilla no encontrada");

// Determinar destinatario
// 🔍 Determinar destinatario
let receiver: User|null;

if (isTutor) {
  // El sender es TUTOR → el destinatario es el responsable de la tarea
  receiver = await User.findByPk(validatedTask.taskUserId, {
    attributes: ['userId', 'userFirstName', 'userLastName', 'userEmail']
  });
} else {
  // El sender es el responsable → el destinatario es el tutor asignado al proyecto
  receiver = await User.findOne({
    attributes: ['userId', 'userFirstName', 'userLastName', 'userEmail'],
    include: [{
      model: Role,
      where: { roleName: RoleEnum.TUTOR }
    }]
  });
}

if (!receiver || !receiver.userEmail) {
  throw new Error("No se encontró el destinatario o no tiene email definido");
}


const html = await renderTemplate(template.notificationTemplateDescription, {
  receiverFirstName: receiver.userFirstName,
  receiverLastName: receiver.userLastName,
  taskName: validatedTask.taskTitle,
  projectName: validatedTask.Stage.Project.projectName,
  linkRedirect: template.notificationTemplatelinkRedirect
});


await sendEmail(receiver.userEmail, template.notificationTemplateEmailSubject, html);

await NotificationEmail.create({
  notificationEmailUserId: receiver.userId,
  notificationEmailNotTemplateId: template.notificationTemplateId,
  createdDate: new Date()
});


    return newComment;
  }


  export async function modifyComment(
    userLoguedId: string,
    commentId: string,
    commentDetail: string,
    commentType: string
  ) {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    // Buscar comentario sin filtrar por usuario
    const updateComment = await Comment.findOne({
      where: { commentId },
      include: [
        {
          model: Task
        }
      ]
    });

    if (!updateComment) throw new NotFoundResultsError();

    // Verificar que el usuario logueado es el autor del comentario
    const isOwner = updateComment.commentUserId === userLoguedId;
    if (!isOwner) throw new ForbiddenAccessError();

    // Validar límite de 60 minutos desde creación
    const createdAt = new Date(updateComment.createdDate);
    const now = new Date();
    const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    if (elapsedMinutes > 60) {
      throw new NotModifiOrDeleteCommentError();
    }

    // Validar tipo de comentario
    const commentTypeExists = await CommentType.findOne({
      where: { commentTypeId: commentType }
    });
    if (!commentTypeExists) throw new StatusNotFoundError();

    // 🔒 Validar que el autor todavía pertenece al proyecto
    const taskAssociated = await updateComment.getTask();
    const stageAssociated = await taskAssociated.getStage();
    const projectAssociated = await stageAssociated.getProject();

    //   const isStillMember = await validateProjectMembershipWhitReturn(userValidated.userId, projectAssociated.projectId);
    //   if (!isStillMember) throw new ForbiddenAccessError();

    // ✅ Actualizar comentario
    updateComment.commentDetail = commentDetail;
    updateComment.commentTypeId = commentTypeExists.commentTypeId;
    updateComment.updatedDate = new Date();

    await updateComment.save();

    return;
  }


  export async function lowComment(userLoguedId: string, commentId: string) {
    const userValidated = await validateActiveUser(userLoguedId);

    const deleteComment = await Comment.findOne({
      where: { commentId },
      include: [{ model: Task }]
    });

    if (!deleteComment) throw new NotFoundResultsError();

    // Validar autoría
    const isOwner = deleteComment.commentUserId === userLoguedId;
    if (!isOwner) throw new ForbiddenAccessError();

    // Validar tiempo límite de 60 minutos
    const createdAt = new Date(deleteComment.createdDate);
    const now = new Date();
    const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (minutesPassed > 60) {
      throw new NotModifiOrDeleteCommentError();
    }

    // Validar que aún pertenece al proyecto
    const taskAssociated = await deleteComment.getTask();
    const stageAssociated = await taskAssociated.getStage();
    const projectAssociated = await stageAssociated.getProject();

    //   const isStillMember = await validateProjectMembershipWhitReturn(userValidated.userId, projectAssociated.projectId);
    //   if (!isStillMember) throw new ForbiddenAccessError();

    // Eliminar comentario
    await deleteComment.destroy();

    return;
  }


  export async function getOneComment(userLoguedId: string, commentId: string) {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    const comment = await Comment.findOne({
      where: { commentId },
      include: [
        {
          model: CommentType,
          attributes: ["commentTypeName"]
        },
        {
          model: User, // Autor del comentario
          attributes: ["userId", "userFirstName", "userLastName"]
        },
        {
          model: Task,
          include: [
            {
              model: TaskStatus,
              attributes: ["taskStatusName"]
            },
            {
              model: User,
              attributes: ["userId", "userFirstName", "userLastName"]
            },
            {
              model: Stage,
              attributes: ["stageName"],
              include: [
                { model: StageStatus },
                {
                  model: Project,
                  include: [{ model: ProjectStatus }]
                }
              ]
            }
          ]
        }
      ]
    });
    if (!comment) {
      throw new NotFoundResultsError();
    }

    const task = comment.Task;
    const isTutor = userRole.roleName === RoleEnum.TUTOR;
    const isOwner = task.taskUserId === userLoguedId;

    if (!isTutor && !isOwner) {
      throw new ForbiddenAccessError();
    }

    const result = mapOneCommentToDto(comment);
    return result;
  }




  export async function listTaskStatus(userLoguedId: string) {
    const userValidated = await validateActiveUser(userLoguedId);

    const taskStatusList = await TaskStatus.findAll()

    return taskStatusList
  }




  export async function listCommentType(userLoguedId: string) {
    const userValidated = await validateActiveUser(userLoguedId);
    const commentType = await CommentType.findAll();
    return commentType
  }



 


export function validateTaskDates(startDateStr: string, endDateStr: string): void {
  const startDate = parse(startDateStr, 'dd-MM-yyyy', new Date());
  const endDate = parse(endDateStr, 'dd-MM-yyyy', new Date());

  if (isBefore(endDate, startDate)) {
    throw new ForbiddenAccessError('La fecha de finalización debe ser posterior a la fecha de inicio.');
  }
}

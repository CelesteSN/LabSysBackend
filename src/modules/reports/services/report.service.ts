import { Op } from "sequelize";
import { TaskStatusEnum } from "../../projects/enums/taskStatus.enum";
import { Task } from "../../projects/models/task.model";
import { TaskStatus } from "../../projects/models/taskStatus.model";
import { parse, isValid } from 'date-fns';
import { BadRequestError, ForbiddenAccessError, UserNotFoundError, NotFoundResultsError } from '../../../errors/customUserErrors';
import { User } from "../../users/models/user.model";
import { UserStatusEnum } from "../../users/enums/userStatus.enum";
import  Stage  from "../../projects/models/stage.model";
 import { RoleEnum } from "../../tasks/enums/role.enum";
import { Attachment } from "../../tasks/models/attachment.model";
import { Comment as TaskComment } from "../../tasks/models/comment.model";
import  ProjectUser  from "../../projects/models/projectUser.model";
import { Project } from "../../projects/models/project.model";
import { forbidden } from "joi";
import { parseISO, format } from "date-fns";
import { getCompletedAndTotalTasks } from "./partials/progress";
import { getDelayedTaskCount } from "./partials/delayed";
import { getUserParticipation } from "./partials/participation";
import { getTaskDistributionByUser } from "./partials/distribution";
import { getDelayedTasksByStageAndUser } from "./partials/delayedByStage";


export async function getFullProjectReport(
  projectId: string,
  fromDate?: Date,
  toDate?: Date
) {
  // 1. Verificamos si el proyecto existe
  const project = await Project.findOne({
    where: { projectId },
    include: [{ association: "ProjectStatus" }]
  });

  if (!project) throw new NotFoundResultsError;

  // 2. Fechas formateadas
  const dateStart = project.projectStartDate
    ? format(project.projectStartDate, "dd-MM-yyyy")
    : null;
  const dateEnd = project.projectEndDate
    ? format(project.projectEndDate, "dd-MM-yyyy")
    : null;

  // 3. Submódulos de reporte
  const progress = await getCompletedAndTotalTasks(projectId, fromDate, toDate);
  const delayedTasksCount = await getDelayedTaskCount(projectId, fromDate, toDate);
  const participation = await getUserParticipation(projectId, fromDate, toDate);
  const taskDistribution = await getTaskDistributionByUser(projectId);
  const delayedByStage = await getDelayedTasksByStageAndUser(projectId);

  // 4. Construcción del DTO
  const report = {
    projectId: project.projectId,
    projectName: project.projectName,
    projectStatus: project.ProjectStatus?.projectStatusName ?? "Sin estado",
    dateStart,
    dateEnd,
    progress,
    delayedTasksCount,
    participation,
    taskDistribution,
    delayedByStage
  };

  return { data: [report] };
}


export async function projectProgress(
  userLoguedId: string,
  projectId: string,
  from?: Date,
  to?: Date
): Promise<number> {
      const userValidated = await validateActiveUser(userLoguedId)
      const userValRole = userValidated.getRole();
      if (!userValRole){throw new UserNotFoundError}

  const dateFilter: any = {};
  if (from && to) {
    dateFilter.taskEndDate = { [Op.between]: [from, to] };
  }

  const statusFinished = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.FINISHED },
  });

  const whereConditions = {
    ...dateFilter,
    taskStageId: { [Op.ne]: null }, // Aseguramos que tenga stage asignado
  };

  const includeStage = {
    model: Stage,
    attributes: [], // No necesitamos campos, solo el filtro
    where: { stageProjectId: projectId },
  };

  const total = await Task.count({
    where: whereConditions,
    include: [includeStage],
  });

  const completed = await Task.count({
    where: {
      ...whereConditions,
      taskStatusId: statusFinished?.taskStatusId,
    },
    include: [includeStage],
  });

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}



export async function delayedTaskCount(
    userLoguedId: string,
  projectId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<number> {
const userValidated = await validateActiveUser(userLoguedId)
      const userValRole = userValidated.getRole();
      if (!userValRole){throw new UserNotFoundError}


  const statusDelayed = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.DELAYED },
  });

  const where: any = {
    taskStatusId: statusDelayed?.taskStatusId,
  };

  if (fromDate && toDate) {
    where.taskEndDate = {
      [Op.between]: [fromDate, toDate],
    };
  }

  return await Task.count({
    where,
    include: [
      {
        model: Stage,
        attributes: [],
        where: { stageProjectId: projectId },
      },
    ],
  });
}


// export async function userParticipation(userLoguedId: string, projectId:string, fromDate:Date, toDate:Date){
// const userValidated = await validateActiveUser(userLoguedId)
//       const userValRole = userValidated.getRole();
//       if (!userValRole){throw new UserNotFoundError}


//     const userIdList = await ProjectUser.findAll({
//         where : {
//             projectUserProjectId: projectId
//         }
//     });
//     if(!userIdList){throw new ForbiddenAccessError("No hay miembros asignados al proyecto")}
// }








// export async function getTaskDistributionByUser(projectId: string) {
//   // 1. Obtener userIds asignados al proyecto
//   const userLinks = await ProjectUser.findAll({
//     where: { projectUserProjectId: projectId },
//   });

//   if (!userLinks || userLinks.length === 0) {
//     throw new ForbiddenAccessError("No hay miembros asignados al proyecto");
//   }

//   const userIds = userLinks.map(link => link.projectUserUserId);

//   // 2. Obtener solo becarios/pasantes de esa lista
//   const users = await User.findAll({
//     where: {
//       userId: { [Op.in]: userIds },
//       roleName: { [Op.in]: [RoleEnum.BECARIO, RoleEnum.PASANTE] }
//     },
//     attributes: ["userId", "userFirstName", "userLastName"]
//   });

//   // 3. Obtener tareas por usuario y contarlas por estado
//   const result = await Promise.all(users.map(async user => {
//     const tasks = await Task.findAll({
//       where: {
//         taskUserId: user.userId
//       },
//       include: [
//         {
//           model: Stage,
//           required: true,
//           where: { stageProjectId: projectId }
//         },
//         {
//           model: TaskStatus,
//           attributes: ["taskStatusName"]
//         }
//       ]
//     });

//     const grouped: Record<string, number> = {};
//     for (const task of tasks) {
//       const statusName = task.TaskStatus?.taskStatusName ?? "SIN_ESTADO";
//       grouped[statusName] = (grouped[statusName] || 0) + 1;
//     }

//     return {
//       name: `${user.userFirstName} ${user.userLastName}`,
//       tasksByStatus: grouped
//     };
//   }));

//   return result;
// }











export function parseDateRangeFromQuery(from?: string, to?: string): { fromDate?: Date; toDate?: Date } {
  let fromDate: Date | undefined = undefined;
  let toDate: Date | undefined = undefined;

  if (from) {
    const parsedFrom = parse(from, 'dd-MM-yyyy', new Date());
    if (!isValid(parsedFrom)) {
      throw new ForbiddenAccessError(`La fecha 'from' no es válida. Debe tener formato dd-MM-yyyy.`);
    }
    fromDate = parsedFrom;
  }

  if (to) {
    const parsedTo = parse(to, 'dd-MM-yyyy', new Date());
    if (!isValid(parsedTo)) {
      throw new ForbiddenAccessError(`La fecha 'to' no es válida. Debe tener formato dd-MM-yyyy.`);
    }
    toDate = parsedTo;
  }

  return { fromDate, toDate };
}



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
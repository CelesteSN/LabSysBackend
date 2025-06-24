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

 // 2. Fechas formateadas para el DTO (prioriza filtros si existen)
const dateStart = fromDate
  ? format(fromDate, "dd-MM-yyyy")
  : (project.projectStartDate ? format(project.projectStartDate, "dd-MM-yyyy") : null);

const dateEnd = toDate
  ? format(toDate, "dd-MM-yyyy")
  : (project.projectEndDate ? format(project.projectEndDate, "dd-MM-yyyy") : null);


  // 3. Submódulos de reporte
  const progress = await getCompletedAndTotalTasks(projectId, fromDate, toDate);
  const delayedTasksCount = await getDelayedTaskCount(projectId, fromDate, toDate);
  const participation = await getUserParticipation(projectId, fromDate, toDate);
  const taskDistribution = await getTaskDistributionByUser(projectId, fromDate, toDate);
  const delayedByStage = await getDelayedTasksByStageAndUser(projectId, fromDate, toDate);

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
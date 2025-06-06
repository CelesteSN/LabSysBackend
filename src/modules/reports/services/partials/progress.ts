import { Op } from "sequelize";
import { Task } from "../../../tasks/models/task.model";
import  Stage  from "../../../tasks/models/stage.model";
import { TaskStatus } from "../../../tasks/models/taskStatus.model";
import { TaskStatusEnum } from "../../../tasks/enums/taskStatus.enum";

export async function getCompletedAndTotalTasks(
  projectId: string,
  fromDate?: Date,
  toDate?: Date
) {
  // 1. Obtener ID del estado "FINALIZADA"
  const finishedStatus = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.FINISHED }
  });

  if (!finishedStatus) {
    throw new Error("No se encontró el estado FINALIZADA");
  }

  // 2. Filtro base por fechas (si hay)
  const dateFilter: any = {};
  if (fromDate && toDate) {
    dateFilter.taskEndDate = {
      [Op.between]: [fromDate, toDate]
    };
  }

  // 3. Filtro para tareas del proyecto (vía stage)
  const baseInclude = {
    model: Stage,
    required: true,
    where: { stageProjectId: projectId },
    attributes: []
  };

  // 4. Total de tareas
  const total = await Task.count({
    where: {
      ...dateFilter
    },
    include: [baseInclude]
  });

  // 5. Tareas finalizadas
  const completed = await Task.count({
    where: {
      ...dateFilter,
      taskStatusId: finishedStatus.taskStatusId
    },
    include: [baseInclude]
  });

  // 6. Porcentaje
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    totalTasks: total,
    completedTasks: completed,
    percentage
  };
}

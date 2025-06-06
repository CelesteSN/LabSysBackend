import { Op } from "sequelize";
import { Task } from "../../../tasks/models/task.model";
import { TaskStatus } from "../../../tasks/models/taskStatus.model";
import { TaskStatusEnum } from "../../../tasks/enums/taskStatus.enum";
import  Stage  from "../../../tasks/models/stage.model";

export async function getDelayedTaskCount(
  projectId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<number> {
  // 1. Buscar ID del estado "ATRASADA"
  const delayedStatus = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.DELAYED }
  });

  if (!delayedStatus) {
    throw new Error("No se encontró el estado ATRASADA");
  }

  // 2. Filtro por fecha (si corresponde)
  const dateFilter: any = {};
  if (fromDate && toDate) {
    dateFilter.taskEndDate = { [Op.between]: [fromDate, toDate] };
  }

  // 3. Conteo de tareas atrasadas en el proyecto
  const count = await Task.count({
    where: {
      taskStatusId: delayedStatus.taskStatusId,
      ...dateFilter
    },
    include: [
      {
        model: Stage,
        required: true,
        where: { stageProjectId: projectId },
        attributes: []
      }
    ]
  });

  return count;
}

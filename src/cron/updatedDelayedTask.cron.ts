import { Task } from "../modules/tasks/models/task.model";
import { TaskStatus } from "../modules/tasks/models/taskStatus.model";
import { TaskStatusEnum } from "../modules/tasks/enums/taskStatus.enum";
import { Op } from "sequelize";

export async function cronUpdateDelayedTasks(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Buscar tareas cuya fecha fin ya pasó y están en progreso o pendiente
  const tasksToUpdate = await Task.findAll({
    where: {
      taskEndDate: { [Op.lt]: today }
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

  // Obtener el estado RETRASADA
  const delayedStatus = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.DELAYED }
  });
  if (!delayedStatus) throw new Error("Estado 'RETRASADA' no encontrado");

  // Actualizar estado de cada tarea
  for (const task of tasksToUpdate) {
    task.taskStatusId = delayedStatus.taskStatusId;
    await task.save();
  }
}

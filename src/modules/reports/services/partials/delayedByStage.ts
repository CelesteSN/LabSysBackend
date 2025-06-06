import { Op } from "sequelize";
import { Task } from "../../../tasks/models/task.model";
import { TaskStatus } from "../../../tasks/models/taskStatus.model";
import Stage  from "../../../tasks/models/stage.model";
import { User } from "../../../tasks/models/user.model";
import { RoleEnum } from "../../../tasks/enums/role.enum";
import { TaskStatusEnum } from "../../../projects/enums/taskStatus.enum";
import { Role } from "../../../users/models/role.model";

export async function getDelayedTasksByStageAndUser(projectId: string) {
  // 1. Obtener ID del estado "ATRASADA"
  const delayedStatus = await TaskStatus.findOne({
    where: { taskStatusName: TaskStatusEnum.DELAYED }
  });

  if (!delayedStatus) {
    throw new Error("No se encontró el estado ATRASADA");
  }

  // 2. Buscar tareas en estado ATRASADA, con Stage y User asociados
  const tasks = await Task.findAll({
  where: {
    taskStatusId: delayedStatus.taskStatusId
  },
  include: [
    {
      model: Stage,
      required: true,
      where: { stageProjectId: projectId },
      attributes: ["stageName"]
    },
    {
      model: User,
      required: true,
      attributes: ["userFirstName", "userLastName"],
      include: [
        {
          model: Role,
          required: true,
          where: {
            roleName: { [Op.in]: [RoleEnum.BECARIO, RoleEnum.PASANTE] }
          },
          attributes: []
        }
      ]
    }
  ]
});


  // 3. Agrupar tareas por usuario + etapa
  const grouped: Record<string, { user: string; stage: string; delayedCount: number }> = {};

  for (const task of tasks) {
    const userName = `${task.User.userFirstName} ${task.User.userLastName}`;
    const stageName = task.Stage.stageName;
    const key = `${userName}-${stageName}`;

    if (!grouped[key]) {
      grouped[key] = {
        user: userName,
        stage: stageName,
        delayedCount: 0
      };
    }

    grouped[key].delayedCount++;
  }

  // 4. Convertir a array ordenado por cantidad descendente
  return Object.values(grouped).sort((a, b) => b.delayedCount - a.delayedCount);
}

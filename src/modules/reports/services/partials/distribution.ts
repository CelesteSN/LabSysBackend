import { Op } from "sequelize";
import { User } from "../../../tasks/models/user.model";
import  ProjectUser  from "../../../tasks/models/projectUser.model";
import { Task } from "../../../tasks/models/task.model";
import { TaskStatus } from "../../../tasks/models/taskStatus.model";
import Stage  from "../../../tasks/models/stage.model";
import { RoleEnum } from "../../../tasks/enums/role.enum";
 import { Role } from "../../../tasks/models/role.model"; // Asegurate de importarlo


export async function getTaskDistributionByUser(projectId: string) {
  // 1. Buscar miembros del proyecto
  const userLinks = await ProjectUser.findAll({
    where: { projectUserProjectId: projectId },
  });

  const userIds = userLinks.map(l => l.projectUserUserId);

  // 2. Filtrar becarios/pasantes

const users = await User.findAll({
  where: {
    userId: { [Op.in]: userIds }
  },
  attributes: ["userId", "userFirstName", "userLastName"],
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
});


  // 3. Obtener tareas por usuario y agrupar por estado
  const result = await Promise.all(users.map(async user => {
    const tasks = await Task.findAll({
      where: { taskUserId: user.userId },
      include: [
        {
          model: Stage,
          required: true,
          where: { stageProjectId: projectId }
        },
        {
          model: TaskStatus,
          attributes: ["taskStatusName"]
        }
      ]
    });

    const tasksByStatus: Record<string, number> = {};
    for (const task of tasks) {
      const status = task.TaskStatus?.taskStatusName ?? "SIN_ESTADO";
      tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
    }

    return {
      name: `${user.userFirstName} ${user.userLastName}`,
      tasksByStatus
    };
  }));

  return result;
}

import { Task } from "../modules/tasks/models/task.model";
import { TaskStatus } from "../modules/tasks/models/taskStatus.model";
import { TaskStatusEnum } from "../modules/tasks/enums/taskStatus.enum";
import { Op } from "sequelize";
import Stage from "../modules/projects/models/stage.model";
import { StageStatus } from "../modules/projects/models/stageStatus.model";
import { StageStatusEnum } from "../modules/projects/enums/stageStatus.enum";
import { ProjectStatus } from "../modules/projects/models/projectStatus.model";
import { ProjectStatusEnum } from "../modules/projects/enums/projectStatus.enum";
import { Project } from "../modules/projects/models/project.model";

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
          taskStatusName: { [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING] }
        }
      },
      {
        model: Stage,
        include: [Project]
      }
    ]
  });

  const updatedStageIds = new Set<string>();
  const updatedProjectIds = new Set<string>();

  const delayedStatus = await TaskStatus.findOne({ where: { taskStatusName: TaskStatusEnum.DELAYED } });
  if (!delayedStatus) throw new Error("Estado 'RETRASADA' no encontrado");

  for (const task of tasksToUpdate) {
    task.taskStatusId = delayedStatus.taskStatusId;
    await task.save();
    updatedStageIds.add(task.taskStageId);
    updatedProjectIds.add(task.Stage.stageProjectId);
  }

  // Actualizar etapas si al menos una tarea está retrasada
  const delayedStageStatus = await StageStatus.findOne({ where: { stageStatusName: StageStatusEnum.DELAYED } });
  if (!delayedStageStatus) throw new Error("Estado de etapa 'RETRASADA' no encontrado");

  for (const stageId of updatedStageIds) {
    await Stage.update(
      { stageStatusId: delayedStageStatus.stageStatusId },
      { where: { stageId } }
    );
  }

  // Actualizar proyectos si al menos una etapa está retrasada
  const delayedProjectStatus = await ProjectStatus.findOne({ where: { projectStatusName: ProjectStatusEnum.DELAYED } });
  if (!delayedProjectStatus) throw new Error("Estado de proyecto 'RETRASADO' no encontrado");

  for (const projectId of updatedProjectIds) {
    await Project.update(
      { projectStatusId: delayedProjectStatus.projectStatusId },
      { where: { projectId } }
    );
  }
}



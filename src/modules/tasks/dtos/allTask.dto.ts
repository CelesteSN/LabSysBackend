import { Task } from "../models/task.model";
import { format } from 'date-fns';

export type ProjectDetailsDto = {
  projectId: string;
  // projectName: string;
  // description?: string | '';
  // objetive?: string |'';
  // startDate: string;
  // endDate: string;
   projectStatus: string; // Nombre del estado del proyecto
  tasks: AllTasksDto[]; // Lista de miembros
};
export type AllTasksDto = {
  id: string;
  stage: string;
  stageOrder: number,
  taskorder: number;
  taskName: string;
  startDate: string;
  endDate: string;
  status: string;
  priority?: number | null;
  owner: string;
};

export function mapTasksToProjectDetailsDto(tasks: Task[]): ProjectDetailsDto {
  

  const firstTask = tasks[0];
  const project = firstTask.Stage?.Project;

  return {
    projectId: project?.projectId ?? "",
    projectStatus: project?.ProjectStatus?.projectStatusName ?? "Sin estado",
    tasks: tasks.map(t => ({
      id: t.taskId,
      stage: t.Stage?.stageName ?? "Sin etapa",
      stageOrder: t.Stage.stageOrder,
      taskorder: t.taskOrder,
      taskName: t.taskTitle,
      startDate: formatDate(t.taskStartDate),
      endDate: formatDate(t.taskEndDate),
      status: t.TaskStatus?.taskStatusName ?? "Sin estado",
      priority: t.taskPriority ?? null,
      owner: `${t.User?.userFirstName ?? ""} ${t.User?.userLastName ?? ""}`.trim() || "Sin asignar",
    }))
  };
}




function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd-MM-yyyy');
}


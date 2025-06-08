import { Task } from "../models/task.model";
import { format } from 'date-fns';


export type OneTaskDto = {
     taskId: string;
    stage: string;
    stageId: string
    owner: string;
    taskName: string;
    taskOrder: number;
    taskDescription?: string | null;
    taskPriority?: number| null;
    taskStartDate: string;
    taskEndDate: string;
    taskStatus: string;
    taskStatusId: string;
    createdDate: string
};

export function mapOneTaskToDto(task: Task): OneTaskDto {
    const dto: any = {
        taskId: task.taskId,
        stage: task.Stage.stageName,
        stageId: task.Stage.stageId,
        owner: `${task.User.userFirstName} ${task.User.userLastName}`,
        taskName: task.taskTitle,
        taskOrder: task.taskOrder,
        taskDescription: task.taskDescription || "",
        taskStartDate: formatDate(task.taskStartDate),
        taskEndDate: formatDate(task.taskEndDate),
        taskStatus: task.TaskStatus.taskStatusName,
        taskStatusId:task.TaskStatus.taskStatusId,
        createdDate: formatDate(task.createdDate)
    };

    if (task.taskPriority != null) {
        dto.taskPriority = task.taskPriority;
    }

    return dto;
}

function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd-MM-yyyy');
}

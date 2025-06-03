import { Task } from "../models/task.model";
import { format } from 'date-fns';


export type OneTaskDto = {
     taskId: string;
    stage: string;
    owner: string;
    taskName: string;
    taskOrder: number;
    taskDescription?: string | null;
    taskPriority?: number| null;
    taskStartDate: string;
    taskEndDate: string;
    taskStatus: string;
    createdDate: string
};

export function mapOneTaskToDto(task: Task): OneTaskDto {
    const dto: any = {
        taskId: task.taskId,
        stage: task.Stage.stageName,
        owner: `${task.User.userFirstName} ${task.User.userLastName}`,
        taskName: task.taskTitle,
        taskOrder: task.taskOrder,
        taskDescription: task.taskDescription || "",
        taskStartDate: formatDate(task.taskStartDate),
        taskEndDate: formatDate(task.taskEndDate),
        taskStatus: task.TaskStatus.taskStatusName,
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

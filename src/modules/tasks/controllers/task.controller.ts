import { catchAsync } from "../../../utils/catchAsync";
import { AllTasksDto } from "../dtos/allTask.dto";
import { TaskFilter } from "../dtos/taskFilters.dto";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import {  addTask, getOneTask, modifyTask, lowTask } from "../services/task.service";
import { Request, Response } from "express";




export async function createTask(req: Request, res: Response) {
    const { userLoguedId } = (req as any).user;

    const stageId = req.body.stageId;
    const taskOrder = req.body.taskOrder;
    const taskName = req.body.taskName;
    const taskDescription = req.body.taskDescription;
    const taskStartDate = req.body.taskStartDate;
    const taskEndoDate = req.body.taskEndDate;
    const priority = req.body.taskPriority;

    const newTask = await addTask(userLoguedId, stageId, taskName, taskOrder, taskStartDate, taskEndoDate, taskDescription, priority);

    res.status(201).json({
        success: true,
        message: "La tarea ha sido creado exitosamente."
    });

}

export async function getTaskById(req: Request, res: Response) {
    const { userLoguedId } = (req as any).user;
    const taskId = req.params.taskId
    const task = await getOneTask(userLoguedId, taskId);
    res.status(200).json({
        success: true,
        data: task
    });
}

export async function updateTask(req: Request, res: Response) {
    const { userLoguedId } = (req as any).user;
    const taskId = req.params.taskId;
    const taskName = req.body.taskName;
    const taskOrder = req.body.taskOrder;
    const taskStartDate = req.body.taskStartDate;
    const taskEndDate = req.body.taskEndDate;
    const taskDescription = req.body.taskDescription;
    const taskStatusId = req.body.taskStatusId;
    const priority = req.body.priority;

    await modifyTask(userLoguedId, taskId, taskName, taskOrder, taskStartDate, taskEndDate, taskStatusId, taskDescription, priority);
    res.status(200).json({
        success: true,
        message: "La tarea ha sido modificada exitosamente"
    })

}


export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const { userLoguedId } = (req as any).user;
  await lowTask(userLoguedId, taskId);
  res.status(200).json({
    success: true,
    message: "La tarea ha sido eliminada exitosamente"
  })
})
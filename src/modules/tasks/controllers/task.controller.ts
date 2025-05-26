import { catchAsync } from "../../../utils/catchAsync";
import { AllTasksDto } from "../dtos/allTask.dto";
import { CommentFilter } from "../dtos/commentFilter.dto";
import { TaskFilter } from "../dtos/taskFilters.dto";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import {  addTask, getOneTask, modifyTask, lowTask, listComment } from "../services/task.service";
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


export async function getAllComments(req: Request, res: Response) {
    const { userLoguedId } = (req as any).user;

    const taskId = req.params.taskId

    const pageNumber = parseInt(req.query.pageNumber as string) || 0;

     const filters: CommentFilter = {
      pageNumber,
       date: req.query.date as string| undefined,
    //     status: req.query.status as TaskStatusEnum || undefined,
    //     priority: req.query.priority ? parseInt(req.query.priority as string) : undefined,
 };
    
    const tasks = await listComment(userLoguedId, taskId, filters);

    if (tasks == null) {
    return res.status(200).json({
      success: true,
      pageNumber,
      message: 'No se encontraron comentarios asociados al proyecto.',
      data: []
    });
  }

    return res.status(200).json({
        success: true,
        pageNumber,
        data: tasks,
    });
};
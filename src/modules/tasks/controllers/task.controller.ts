import { AllTasksDto } from "../dtos/allTask.dto";
import { listTask, addTask } from "../services/task.service";
import { Request, Response } from "express";

export async function getAllTask(req: Request, res: Response) {
  const { userLoguedId } = (req as any).user;

      const projectId = req.body.projectId

  //const pageNumber = parseInt(req.query.pageNumber as string) || 0;

//   const filters: ProjectFilter = {
//     pageNumber,
//     search: req.query.search as string,
//     status: req.query.status as ProjectStatusEnum || undefined,
//   };
  const tasks = await listTask(userLoguedId, projectId);

  if (tasks.tasks.length === 0) {
    return res.status(200).json({
      success: true,
      //pageNumber,
      message: 'No se encontraron resultados',
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    //pageNumber,
    data: tasks,
  });
};


export async function createTask(req: Request, res: Response){
  const { userLoguedId } = (req as any).user;

    const stageId = req.params.stageId
    const taskOrder = req.body.taskOrder;
    const taskName = req.body.taskName;
    const taskDescription = req.body.taskDescription;
    const taskStartDate = req.body.taskStartDate;
    const taskEndoDate = req.body.taskEndoDate;
    const priority = req.body.priority;

    const newTask = await addTask(userLoguedId, stageId, taskOrder, taskName, taskDescription, taskStartDate, taskEndoDate, priority);

    res.status(201).json({
    success: true,
    message: "La tarea ha sido creado exitosamente."
  });

}
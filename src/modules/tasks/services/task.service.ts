
import { Task } from "../models/task.model";
import { TaskStatus } from "../models/taskStatus.model";
import { ProjectDetailsDto, mapTasksToProjectDetailsDto } from "../dtos/allTask.dto";
import { User } from "../models/user.model";
import Stage from "../models/stage.model";
import { UserStatusEnum } from "../enums/userStatus.enum";
import ProjectUser from "../models/projectUser.model";
import { EmailAlreadyExistsError, RoleNotFoundError, StatusNotFoundError, UserNotFoundError, ForbiddenError, ForbiddenAccessError, UserAlreadyDeletedError, NotFoundResultsError, NameUsedError, OrderExistsError, NotModifiOrDeleteCommentError } from '../../../errors/customUserErrors';
import { parse, addDays } from 'date-fns';
import { RoleEnum } from "../enums/role.enum";
import { Op } from "sequelize";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import { Project } from "../models/project.model";
import { ProjectStatus } from "../models/projectStatus.model";
import { ProjectStatusEnum } from "../../projects/enums/projectStatus.enum";
import { StageStatus } from "../models/stageStatus.model";
import { StageStatusEnum } from "../../projects/enums/stageStatus.enum";
import { mapOneTaskToDto, OneTaskDto } from "../dtos/oneTask.dto";
import { TaskFilter } from "../dtos/taskFilters.dto";
import { appConfig } from "../../../config/app";
import { Comment } from "../models/comment.model";
import { CommentType } from "../models/commentType.model";
import { AllCommentsDto, mapCommentToTaskDetailsDto, TaskDetailsDto } from "../dtos/allCommnet.dto";
import { CommentFilter } from "../dtos/commentFilter.dto";








export async function addTask(userLoguedId: string, stageId: string, taskName: string, taskOrder: number, taskStartDate: string, taskEndDate: string, taskDescription?: string, priority?: number) {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();


    if (!(userRole.roleName == RoleEnum.BECARIO || userRole.roleName == RoleEnum.PASANTE)) { throw new ForbiddenAccessError(); }

    //Valido si es miembro y si la etapa esta en estado pendiente o en preogreso
    const stage1 = await Stage.findOne({
        where: { stageId: stageId },
        include: [
            {
                model: StageStatus,
                where: { "stageStatusName": { [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING] } }
            },
            {
                model: Project,
                include: [
                    {
                        model: ProjectStatus,
                        where: {
                            projectStatusName: {
                                [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
                            }
                        },
                        attributes: ["projectStatusName"]
                    }
                ]
            }
        ],
    })
    if (!stage1) { throw new NotFoundResultsError(); }
    const pro = await stage1.getProject()
    //Validar que este asignado al proyecto
    await validateProjectMembership(userLoguedId, pro.projectId);

    //Valido el proyecto ingresado
    // const project = await Project.findOne({
    //     where: { "projectStageId": stageId },
    //     include: [
    //         {
    //             model: ProjectStatus,
    //             where: {
    //                 projectStatusName: {
    //                     [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
    //                 }
    //             },
    //         },
    //     ]
    // });

    // if (!project) {
    //     throw new NotFoundResultsError();
    // }


    //Valido que el nombre ingresado no exista
    const taskExists = await Task.findOne({
        where: {
            taskTitle: taskName,
            taskStageId: stageId
        },
    });
    if (taskExists) { throw new NameUsedError() };

    //valido el orden
    const orderExist = await Task.findOne({
        where: {
            taskOrder: Number(taskOrder),
            taskStageId: stageId
        }
    })
    if (orderExist) { throw new OrderExistsError() };

    //obtengo el estado pendiente
    let statusPending = await TaskStatus.findOne({
        where: {
            taskStatusName: TaskStatusEnum.PENDING
        }
    });
    // console.log(status?.userStatusName)
    if (!statusPending) {
        throw new StatusNotFoundError();
    }

    const newTask = await Task.build();
    newTask.taskTitle = taskName,
        newTask.taskDescription = taskDescription || null,
        newTask.taskOrder = Number(taskOrder),
        newTask.taskPriority = Number(priority) || null,
        newTask.createdDate = new Date(),
        newTask.updatedDate = new Date(),
        newTask.taskStartDate = parse(taskStartDate, 'dd-MM-yyyy', new Date()),
        newTask.taskEndDate = parse(taskEndDate, 'dd-MM-yyyy', new Date()),
        newTask.taskStageId = stage1.stageId,
        newTask.taskStatusId = statusPending.taskStatusId,
        newTask.taskUserId = userValidated.userId

    await updateStageProgress(newTask.taskStageId);
    await updateStageDates(newTask.taskStageId);

    await newTask.save();
    return
}



export async function updateStageDates(stageId: string): Promise<void> {
    // Obtener todas las tareas de la etapa
    const tasks = await Task.findAll({
        where: {
            taskStageId: stageId
        },
        attributes: ["taskStartDate", "taskEndDate"]
    });

    if (tasks.length === 0) {
        // Si no hay tareas, limpiar fechas
        await Stage.update(
            {
                stageStartDate: null,
                stageEndDate: null
            },
            {
                where: { stageId }
            }
        );
        return;
    }

    // Obtener fechas mínimas y máximas
    const startDates = tasks.map(t => t.taskStartDate).filter(Boolean) as Date[];
    const endDates = tasks.map(t => t.taskEndDate).filter(Boolean) as Date[];

    const minStartDate = startDates.length ? new Date(Math.min(...startDates.map(d => d.getTime()))) : null;
    const maxEndDate = endDates.length ? new Date(Math.max(...endDates.map(d => d.getTime()))) : null;

    // Actualizar etapa
    await Stage.update(
        {
            stageStartDate: minStartDate,
            stageEndDate: maxEndDate
        },
        {
            where: { stageId }
        }
    );
}

export async function getOneTask(userLoguedId: string, taskId: string): Promise<OneTaskDto> {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    const isRestrictedRole = [RoleEnum.BECARIO, RoleEnum.PASANTE].includes(userRole.roleName as RoleEnum);


    const task = await Task.findOne({
        where: {
            taskId: taskId
        },
        include: [
            {
                model: TaskStatus,
                where: {
                    taskStatusName:
                        { [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING] }
                },
                attributes: ["taskStatusName"]
            },
            {
                model: User,
                ...(isRestrictedRole
                    ? {
                        where: {
                            userId: userLoguedId
                        }
                    }
                    : {}),
            },
            {
                model: Stage,
                attributes: ["stageName"],
                include: [
                    {
                        model: StageStatus,
                        where: { stageStatusName: { [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING] } }
                    },
                    {
                        model: Project,
                        include: [
                            {
                                model: ProjectStatus,
                                where: {
                                    projectStatusName: {
                                        [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
                                    }
                                },
                            }
                        ]
                    }
                ],
            }
        ]
    })

    if (!task) { throw new NotFoundResultsError(); }
    const stageAux = await task.getStage();
    const pro = await stageAux.getProject()
    if (!(await validateProjectMembershipWhitReturn(userValidated.userId, pro.projectId) || userRole.roleName === RoleEnum.TUTOR)) {
        throw new ForbiddenAccessError()
    }
    const result = mapOneTaskToDto(task)

    return result
}



export async function modifyTask(userLoguedId: string, taskId: string, taskName: string, taskOrder: number, taskStartDate: string, taskEndDate: string, taskStatus: string, taskDescription?: string, priority?: number): Promise<Task | null> {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
        throw new ForbiddenAccessError()
    }

    //Obtener la tarea y la valido
    //Valido el proyecto ingresado
    const updatedTask = await Task.findOne({
        where: {
            taskId: taskId,
            taskUserId: userLoguedId
        },
        include: [
            {
                model: TaskStatus,
                where: {
                    taskStatusName:
                        { [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING] }
                },
                attributes: ["taskStatusName"]
            },
            {
                model: User,
                where: {
                    userId: userLoguedId
                }
            },
            {
                model: Stage,
                attributes: ["stageName"],
                include: [
                    {
                        model: StageStatus,
                        where: { stageStatusName: { [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING] } }
                    },
                    {
                        model: Project,
                        include: [
                            {
                                model: ProjectStatus,
                                where: {
                                    projectStatusName: {
                                        [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
                                    }
                                },
                            }
                        ]
                    }
                ],
            }]
    })

    if (!updatedTask) { throw new NotFoundResultsError(); }
    const stageAux = await updatedTask.getStage();
    const proy = await stageAux.getProject()
    if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId))) {
        throw new ForbiddenAccessError()
    }

    //Valido que el nombre ingresado no exista
    const taskNameExists = await Task.findOne({
        where: {
            taskTitle: taskName,
            taskStageId: stageAux.stageId,
            taskId: { [Op.ne]: taskId } // excluye la etapa actual
        },
    });
    if (taskNameExists) { throw new NameUsedError() };


    //valido el orden
    const orderExist = await Task.findOne({
        where: {
            taskOrder: taskOrder,
            taskStageId: stageAux.stageId,
            taskId: { [Op.ne]: taskId } // excluye la etapa actual

        }
    })
    if (orderExist) { throw new OrderExistsError() };

    //valido el status
    const validStatus = await TaskStatus.findOne({
        where: {
            taskStatusId: taskStatus
        }
    });
    if (!validStatus) { throw new StatusNotFoundError() };

    updatedTask.taskTitle = taskName;
    updatedTask.taskOrder = taskOrder;
    updatedTask.updatedDate = new Date();
    updatedTask.taskStartDate = parse(taskStartDate, 'dd-MM-yyyy', new Date()),
        updatedTask.taskEndDate = parse(taskEndDate, 'dd-MM-yyyy', new Date()),
        updatedTask.taskPriority = Number(priority) || null,
        updatedTask.taskDescription = taskDescription || null,
        updatedTask.taskStatusId = validStatus.taskStatusId,


        await updatedTask.save(); // Guardar los cambios en la base de datos
    await updateStageProgress(updatedTask.taskStageId);
    await updateStageDates(updatedTask.taskStageId);
    return updatedTask;
}


export async function lowTask(userLoguedId: string, taskId: string) {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
        throw new ForbiddenAccessError()
    }

    const deletedTask = await Task.findOne({
        where: {
            taskId: taskId,
            taskUserId: userLoguedId
        },
        include: [
            {
                model: TaskStatus,
                where: {
                    taskStatusName: {
                        [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING]
                    }
                },
            },
        ]

    });
    if (!deletedTask) {
        throw new NotFoundResultsError();
    }

    //Obtener el id de proyecto a partir de la etapa

    const taskStage = await deletedTask.getStage();
    const stageProject = await taskStage.getProject();

    //Validar que este asignado al proyecto
    await validateProjectMembership(userLoguedId, stageProject.projectId);

    deletedTask.destroy();
    await updateStageProgress(deletedTask.taskStageId);
    await updateStageDates(deletedTask.taskStageId);
    return
}

//Función para validar si existe el usuario y si esta en estado activo

export async function validateActiveUser(userId: string): Promise<User> {

    const user = await User.findByPk(userId);
    if (!user) throw new UserNotFoundError();

    const userStatus = await user.getUserStatus();
    if (userStatus.userStatusName !== UserStatusEnum.ACTIVE) {
        // throw Errors.forbiddenAccessError("El usuario no está activo");
        throw new ForbiddenAccessError();
    }

    return user;
}




//Funcion para validar si un usuario es miembro de un proyecto
export async function validateProjectMembership(userId: string, projectId: string): Promise<void> {
    const isMember = await ProjectUser.findOne({
        where: {
            projectUserProjectId: projectId,
            projectUserUserId: userId
        }
    });

    if (!isMember) {
        throw new ForbiddenAccessError("No tiene permiso para realizar esta acción en el proyecto.");
    }
}


export async function validateProjectMembershipWhitReturn(userId: string, projectId: string): Promise<boolean> {
    const membership = await ProjectUser.findOne({
        where: {
            projectUserUserId: userId,
            projectUserProjectId: projectId
        }
    });

    return !!membership; // retorna true si existe, false si no
}



export async function updateStageProgress(stageId: string): Promise<void> {
    // Traer todas las tareas de la etapa
    const tasks = await Task.findAll({
        where: { taskStageId: stageId },
        include: [
            {
                model: TaskStatus,
                attributes: ["taskStatusName"]
            }
        ]
    });

    const totalTasks = tasks.length;
    if (totalTasks === 0) {
        await Stage.update({ stageProgress: 0 }, { where: { stageId } });
        return;
    }

    // Contar las tareas finalizadas
    const completedTasks = tasks.filter(task =>
        task.TaskStatus?.taskStatusName?.toUpperCase() === "FINALIZADA"
    ).length;

    const progress = Math.round((completedTasks / totalTasks) * 100);

    // Actualizar el progreso de la etapa
    await Stage.update({ stageProgress: progress }, { where: { stageId } });
}


export async function listComment(userLoguedId: string, taskId: string, filters: CommentFilter): Promise<TaskDetailsDto | null> {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    const whereConditions: any = {};



    if (filters?.date) {
        const startDate = parse(filters.date, 'dd-MM-yyyy', new Date());
        const endDate = addDays(startDate, 1); // día siguiente a las 00:00

        whereConditions.createdDate = {
            [Op.gte]: startDate,
            [Op.lt]: endDate
        };
    }

    //Obtener la tarea y la valido
    const taskExist = await Task.findOne({
        where: { taskId: taskId },
        include: [{
            model: Stage,
            include: [{
                model: Project
            }]
        }],
    });
    if (!taskExist) { throw new NotFoundResultsError };


    const stageAux = await taskExist.getStage();
    const proy = await stageAux.getProject()


    if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId) || userRole.roleName === RoleEnum.TUTOR)) {
        throw new ForbiddenAccessError()
    }

    //Obtengo el listado de comentarios asociados a la tarea
    const commentList = await Comment.findAll({
        where: whereConditions,
        attributes: ["commentId", "createdDate", "commentDetail"],
        include: [
            {
                model: CommentType,
                attributes: ["commentTypeName"]
            },
            {
                model: User,
                attributes: ["userFirstName", "userLastName"]
            },
            {
                model: Task,
                where: {
                    taskId: taskId,
                    //taskUserId: userLoguedId
                },
                attributes: ["taskId"],
                include: [{
                    model: TaskStatus,
                    attributes: ["taskStatusName"]

                }]
            }],
        order: [['createdDate', 'DESC']],
        limit: parseInt(appConfig.ROWS_PER_PAGE),
        offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
    });
    if (commentList.length == 0) { return null }
    const result = mapCommentToTaskDetailsDto(commentList)
    return result;
}


export async function addComment(userLoguedId: string, taskId: string, commentDetail: string, commentType: string) {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
        throw new ForbiddenAccessError()
    }

    //Obtener la tarea y la valido
    //Valido el proyecto ingresado
    const validatedTask = await Task.findOne({
        where: {
            taskId: taskId,
            taskUserId: userLoguedId
        },
        include: [
            {
                model: TaskStatus,
                where: {
                    taskStatusName:
                        { [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING] }
                },
                attributes: ["taskStatusName"]
            },
            {
                model: User,
                where: {
                    userId: userLoguedId
                }
            },
            {
                model: Stage,
                attributes: ["stageName"],
                include: [
                    {
                        model: StageStatus,
                        where: { stageStatusName: { [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING] } }
                    },
                    {
                        model: Project,
                        include: [
                            {
                                model: ProjectStatus,
                                where: {
                                    projectStatusName: {
                                        [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
                                    }
                                },
                            }
                        ]
                    }
                ],
            }]
    })

    if (!validatedTask) { throw new NotFoundResultsError(); }
    const stageAux = await validatedTask.getStage();
    const proy = await stageAux.getProject()
    if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId))) {
        throw new ForbiddenAccessError()
    }

    //Valido tipo de comentario ingresado
    const commentTypeExists = await CommentType.findOne({
        where: {
            commentTypeId: commentType,
        },
    });
    if (!commentTypeExists) { throw new StatusNotFoundError };

    //creo el comment y lo asocio a la tarea
    const newComment = await Comment.build();
    newComment.commentDetail = commentDetail;
    newComment.commentTypeId = commentTypeExists.commentTypeId;
    newComment.commentTaskId = validatedTask.taskId;
    newComment.commentUserId = userValidated.userId;
    newComment.createdDate = new Date();
    newComment.updatedDate = new Date();

    newComment.save()
    return

}


export async function modifyComment(userLoguedId: string, commentId: string, commentDetail: string, commentType: string) {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    

    const updateComment = await Comment.findOne({
        where: {
            commentId
        },
        include: [
            {
                model: User,
                where: { userId: userLoguedId }
            },
            {
                model: Task,
            },
        ],
    });

    if (!updateComment) { throw new NotFoundResultsError };


    const createdAt = new Date(updateComment.createdDate);
    const now = new Date();

    if ((now.getTime() - createdAt.getTime()) / (1000 * 60) > 60) {
        throw new NotModifiOrDeleteCommentError();
    }



    //  const validatedTask = await Task.findOne({
    //         where: {
    //             taskId: taskId,
    //             taskUserId: userLoguedId
    //         },
    //         include: [
    //             {
    //                 model: TaskStatus,
    //                 where: {
    //                     taskStatusName:
    //                         { [Op.or]: [TaskStatusEnum.INPROGRESS, TaskStatusEnum.PENDING] }
    //                 },
    //                 attributes: ["taskStatusName"]
    //             },
    //             {
    //                 model: User,
    //                 where: {
    //                     userId: userLoguedId
    //                 }
    //             },
    //             {
    //                 model: Stage,
    //                 attributes: ["stageName"],
    //                 include: [
    //                     {
    //                         model: StageStatus,
    //                         where: { stageStatusName: { [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING] } }
    //                     },
    //                     {
    //                         model: Project,
    //                         include: [
    //                             {
    //                                 model: ProjectStatus,
    //                                 where: {
    //                                     projectStatusName: {
    //                                         [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
    //                                     }
    //                                 },
    //                             }
    //                         ]
    //                     }
    //                 ],
    //             }]
    //     })

    //     if (!validatedTask) { throw new NotFoundResultsError(); }
    //     const stageAux = await validatedTask.getStage();
    //     const proy = await stageAux.getProject()
    //     if (!(await validateProjectMembershipWhitReturn(userValidated.userId, proy.projectId))) {
    //         throw new ForbiddenAccessError()
    //     }



    //Valido tipo de comentario ingresado
    const commentTypeExists = await CommentType.findOne({
        where: {
            commentTypeId: commentType,
        },
    });
    if (!commentTypeExists) { throw new StatusNotFoundError };


    //obtengo la tarea asociada y el uduario asociado
    const taskAsociated = await updateComment.getTask();
    const stageAsociated = await taskAsociated.getStage();
    const projectAsociated = await stageAsociated.getProject();


    if (userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE ){
    if (!(await validateProjectMembershipWhitReturn(userValidated.userId, projectAsociated.projectId))) {
        throw new ForbiddenAccessError()
    }
    }

    //modifico el comment 
    updateComment.commentDetail = commentDetail;
    updateComment.commentTypeId = commentTypeExists.commentTypeId;
    updateComment.commentTaskId = taskAsociated.taskId;
    updateComment.commentUserId = userValidated.userId;
    updateComment.updatedDate = new Date();

    updateComment.save()
    return
}

export async function lowComment(userLoguedId: string, commentId: string){
 const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE )) {
        throw new ForbiddenAccessError()
    }

    const deleteComment = await Comment.findOne({
        where: {
            commentId
        },
        include: [
            {
                model: User,
                where: { userId: userLoguedId }
            },
            {
                model: Task,
            },
        ],
    });

    if (!deleteComment) { throw new NotFoundResultsError };


    const createdAt = new Date(deleteComment.createdDate);
    const now = new Date();

    if ((now.getTime() - createdAt.getTime()) / (1000 * 60) > 60) {
        throw new NotModifiOrDeleteCommentError();
    }


      //obtengo la tarea asociada y el uduario asociado
    const taskAsociated = await deleteComment.getTask();
    const stageAsociated = await taskAsociated.getStage();
    const projectAsociated = await stageAsociated.getProject();


    if (userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE ){
    if (!(await validateProjectMembershipWhitReturn(userValidated.userId, projectAsociated.projectId))) {
        throw new ForbiddenAccessError()
    }
    }
deleteComment.destroy();
return
}
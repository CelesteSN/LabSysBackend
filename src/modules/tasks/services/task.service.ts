
import { Task } from "../models/task.model";
import { TaskStatus } from "../models/taskStatus.model";
import { ProjectDetailsDto, mapTasksToProjectDetailsDto } from "../dtos/allTask.dto";
import { User } from "../models/user.model";
import Stage from "../models/stage.model";
import { UserStatusEnum } from "../enums/userStatus.enum";
import ProjectUser from "../models/projectUser.model";
import { EmailAlreadyExistsError, RoleNotFoundError, StatusNotFoundError, UserNotFoundError, ForbiddenError, ForbiddenAccessError, UserAlreadyDeletedError, NotFoundResultsError, NameUsedError, OrderExistsError } from '../../../errors/customUserErrors';
import { parse } from 'date-fns';
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


export async function listTask(userLoguedId: string, projectId: string, filters: TaskFilter): Promise<ProjectDetailsDto|null> {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();
    const isRestrictedRole = [RoleEnum.BECARIO, RoleEnum.PASANTE].includes(userRole.roleName as RoleEnum);

    const whereConditions: any = {};

    // Filtro por búsqueda
    if (filters?.search) {
        whereConditions[Op.or] = [
            { taskTitle: { [Op.iLike]: `%${filters.search}%` } }
        ];
    }

    // // Filtro por estado de la tarea (taskStatusId)
    // if (filters?.status) {
    //     whereConditions.taskStatusName = filters.status;
    // }

    // Filtro por prioridad
    if (filters?.priority) {
        whereConditions.taskPriority = filters.priority;
    }
    const taskList = await Task.findAll({
        where: whereConditions,
        attributes: ["taskId", "taskTitle", "taskOrder", "taskPriority", "taskStartDate", "taskEndDate"],
        include: [
            {
                 model: TaskStatus,
            attributes: ["taskStatusName"],
            ...(filters?.status
                ? {
                    where: {
                        taskStatusName: {
                            [Op.iLike]: `%${filters.status}%`
                        }
                    }
                }
                : {})
            },
            {
                model: User,
                attributes: ["userFirstName", "userLastName"],
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
                attributes: ["stageName", "stageOrder"],
                include: [
                    {
                        model: Project,
                        where: { projectId },
                        attributes: ["projectId", "projectName"],
                        include: [
                            {
                                model: ProjectStatus,
                                attributes: ["projectStatusName"]
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            [Stage, 'stageOrder', 'ASC'],
            [Stage, 'stageName', 'ASC'],
            ['taskOrder', 'ASC']
        ],
        limit: parseInt(appConfig.ROWS_PER_PAGE),
        offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
    });
if (taskList.length == 0) {
    //throw new NotFoundResultsError();
    return null
  }
    const result = mapTasksToProjectDetailsDto(taskList);
    return result;
}




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


    await newTask.save();
    return
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
            }]
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
            taskName: taskName,
            taskStageId: stageAux.stageId,
            stageId: { [Op.ne]: taskId } // excluye la etapa actual
        },
    });
    if (taskNameExists) { throw new NameUsedError() };


    //valido el orden
    const orderExist = await Task.findOne({
        where: {
            "taskOrder": taskOrder,
            taskStageId: stageAux.stageId,
            taskId: { [Op.ne]: taskId } // excluye la etapa actual

        }
    })
    if (orderExist) { throw new OrderExistsError() };

    //valido el status
    const validStatus = await TaskStatus.findOne({
        where: {
            taskStatusName: taskStatus
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

    return updatedTask;
}





export async function lowTask(userLoguedId: string, taskId: string) {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
        throw new ForbiddenAccessError()
    }

    const deletedTask = await Task.findOne({
        where: { "taskId": taskId },
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



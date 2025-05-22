
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




//export async function listTask(userLoguedId: string, filters: taskFilters): Promise<AllTasksDto[]> {
export async function listTask(userLoguedId: string, projectId: string): Promise<ProjectDetailsDto> {
    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();


    const taskList = await Task.findAll({
  attributes: ["taskId", "taskTitle", "taskOrder", "taskPriority", "taskStartDate", "taskEndDate"],
  include: [
    {
      model: TaskStatus,
      attributes: ["taskStatusName"]
    },
    {
      model: User,
      attributes: ["userFirstName", "userLastName"]
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
              attributes: ["projectStatusName"] // Corrige aquí el nombre
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
]
});
  const result = mapTasksToProjectDetailsDto(taskList);

return result;

    //   const whereConditions: any = {};

    //   const statusRaw = filters?.status?.trim();
    //   const status = statusRaw ?? ProjectStatusEnum.INPROGRESS;
    //   const isStatusAll = status.toLowerCase() === ProjectStatusEnum.ALL.toLowerCase();

    //   if (filters?.search) {
    //     whereConditions[Op.or] = [
    //       { projectName: { [Op.iLike]: `%${filters.search}%` } }, // corregido el typo
    //     ];
    //   }

    //   // Configuración base del query
    //   const baseQuery: any = {
    //     where: whereConditions,
    //     attributes: ['projectId', 'projectName', 'projectStartDate', 'projectEndDate', 'createdDate'],
    //     include: [],
    //     order: [["createdDate", "ASC"]],
    //     limit: parseInt(appConfig.ROWS_PER_PAGE),
    //     offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
    //   };

    //   // Filtro por estado del proyecto
    //   const statusInclude = {
    //     model: TaskStatus,
    //     attributes: ['projectStatusName'],
    //     ...(isStatusAll ? {} : { where: { projectStatusName: status } })
    //   };

    //   // Condicional por rol
    //   if (userRole.roleName === RoleEnum.TUTOR) {
    //     baseQuery.include.push(statusInclude);
    //   } else if (RoleEnum.BECARIO === userRole.roleName || userRole.roleName === RoleEnum.PASANTE) {
    //     baseQuery.include.push(
    //       {
    //         model: ProjectUser,
    //         as: "projectUsers",
    //         where: {
    //           projectUserUserId: userValidated.userId
    //         }
    //       },
    //       statusInclude
    //     );
    //   }

    //   const projects = await Project.findAll(baseQuery);
    //   return projects.map(mapProjectToDto);
}


export async function addTask(userLoguedId: string, stageId: string, taskName: string, taskOrder: number, taskDescription: string, taskStartDate: string, taskEndDate: string, priority: number) {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();


    if (!(userRole.roleName == RoleEnum.BECARIO || userRole.roleName == RoleEnum.PASANTE)) { throw new ForbiddenAccessError(); }

    //Valido si es miembro y si la etapa esta en estado pendiente o en preogreso
    const stage1 = await Stage.findOne({
        where: { "stageId": stageId },
        include: [
            {
                model: StageStatus,
                where: { "stageStatusName": { [Op.or]: [StageStatusEnum.INPROGRESS, StageStatusEnum.PENDING] } }
            },
            {
                model: Project
            }
        ],
    })
    if (!stage1) { throw new NotFoundResultsError(); }
    const pro = await stage1.getProject()
    //Validar que este asignado al proyecto
    await validateProjectMembership(userLoguedId, pro.projectId);

    //Valido el proyecto ingresado
    const project = await Project.findOne({
        where: { "projectStageId": stageId },
        include: [
            {
                model: ProjectStatus,
                where: {
                    projectStatusName: {
                        [Op.or]: [ProjectStatusEnum.INPROGRESS, ProjectStatusEnum.ACTIVE]
                    }
                },
            },
        ]
    });

    if (!project) {
        throw new NotFoundResultsError();
    }


    //Valido que el nombre ingresado no exista
    const stageExists = await Task.findOne({
        where: {
            "taskTitle": taskName,
            "taskStageId": stageId
        },
    });
    if (stageExists) { throw new NameUsedError() };

    //valido el orden
    const orderExist = await Task.findOne({
        where: {
            "taskOrder": taskOrder,
            "taskStageId": stageId
        }
    })
    if (orderExist) { throw new OrderExistsError() };

    //obtengo el estado pendiente
    let status = await TaskStatus.findOne({
        where: {
            "taskStatusName": TaskStatusEnum.PENDING
        }
    });
    // console.log(status?.userStatusName)
    if (!status) {
        throw new StatusNotFoundError();

    }


    const newTask = await Task.build();
    newTask.taskTitle = taskName,
        newTask.taskDescription = taskDescription,
        newTask.taskOrder = taskOrder,
        newTask.taskPriority = priority,
        newTask.createdDate = new Date(),
        newTask.updatedDate = new Date(),
        newTask.taskStartDate = parse(taskStartDate, 'dd-MM-yyyy', new Date()),
        newTask.taskEndDate = parse(taskEndDate, 'dd-MM-yyyy', new Date()),

        await newTask.save();
}


export async function getOneTask(userLoguedId: string, taskId: string) {
    const userValidated = await validateActiveUser(userLoguedId);
    const oneTask = await Task.findOne({
        where: {
            "taskId": taskId
        },
        include: [{
            model: TaskStatus
        },
        { model: User },
        { model: Stage }],
    });
    return oneTask
}

export async function modifyTask(userLoguedId: string, taskId: string, taskName: string, taskOrder: number): Promise<Task | null> {

    const userValidated = await validateActiveUser(userLoguedId);
    const userRole = await userValidated.getRole();

    if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
        throw new ForbiddenAccessError()
    }

    //Obtener el proyecto a partir de la etapa
    //Valido el proyecto ingresado
    const taskUpdated = await Task.findOne({
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

    if (!taskUpdated) {
        throw new NotFoundResultsError();
    }

    const stage1 = await taskUpdated.getStage();
    const pro = await stage1.getProject()
    //Validar que este asignado al proyecto
    await validateProjectMembership(userLoguedId, pro.projectId);


    //Valido que el nombre ingresado no exista
    const taskNameExists = await Task.findOne({
        where: {
            taskName: taskName,
            taskStageId: stage1.stageId,
            stageId: { [Op.ne]: taskId } // excluye la etapa actual
        },
    });
    if (taskNameExists) { throw new NameUsedError() };


    //valido el orden
    const orderExist = await Task.findOne({
        where: {
            "taskOrder": taskOrder,
            taskStageId: stage1.stageId,
            taskId: { [Op.ne]: taskId } // excluye la etapa actual

        }
    })
    if (orderExist) { throw new OrderExistsError() };


    taskUpdated.taskTitle = taskName;
    taskUpdated.taskOrder = taskOrder;
    taskUpdated.updatedDate = new Date();


    await taskUpdated.save(); // Guardar los cambios en la base de datos

    return taskUpdated;
}


//Función para validar si existe el usuario y si esta en estado activo



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



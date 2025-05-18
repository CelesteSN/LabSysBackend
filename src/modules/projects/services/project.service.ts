//import { add } from "winston";
import { Project } from "../models/project.model";
import bcrypt from "bcrypt";
import { ProjectStatus } from "../models/projectStatus.model";
import { ProjectStatusEnum } from "../enums/projectStatus.enum";
import { ProjectTypeEnum } from "../enums/projectType.enum";
import { ProjectType } from "../models/projectType.model";
import { randomUUID } from "crypto";
import { User } from "../models/user.model"
import { ForbiddenAccessError, UserNotFoundError, NameUsedError, NotFoundResultsError, StatusNotFoundError, OrderExistsError } from "../../../errors/customUserErrors";
import { RoleEnum } from "../../users/enums/role.enum";
import { Op } from "sequelize";
import { ProjectFilter } from "../dtos/projectFilters.dto";
import { AllProjectsDto, mapProjectToDto } from "../dtos/allProjects.dto";
import { appConfig } from "../../../config/app";
import { mapOneProjectToDto, OneProjectDto } from "../dtos/oneProjectResponse.dto";
import ProjectUser from "../models/projectUser.model";
import { Role } from "../models/role.model";
import Stage from "../models/stage.model";
import { StageStatus } from "../models/stageStatus.model";
import { ProjectStagesDto, mapToProjectStagesDto } from "../dtos/allStages.dto";
import { StageStatusEnum } from "../enums/stageStatus.enum";
import { mapProjectToDetailsDto } from "../dtos/listMembers.dto";
import { parse } from 'date-fns';




export async function listProjects(userLoguedId: string, filters: ProjectFilter): Promise<AllProjectsDto[]> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  const whereConditions: any = {};

  const statusRaw = filters?.status?.trim();
  const status = statusRaw ?? ProjectStatusEnum.INPROGRESS;
  const isStatusAll = status.toLowerCase() === ProjectStatusEnum.ALL.toLowerCase();

  if (filters?.search) {
    whereConditions[Op.or] = [
      { projectName: { [Op.iLike]: `%${filters.search}%` } }, // corregido el typo
    ];
  }

  // Configuración base del query
  const baseQuery: any = {
    where: whereConditions,
    attributes: ['projectId', 'projectName', 'projectStartDate', 'projectEndDate', 'createdDate'],
    include: [],
    order: [["createdDate", "ASC"]],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  };

  // Filtro por estado del proyecto
  const statusInclude = {
    model: ProjectStatus,
    attributes: ['projectStatusName'],
    ...(isStatusAll ? {} : { where: { projectStatusName: status } })
  };

  // Condicional por rol
  if (userRole.roleName === RoleEnum.TUTOR) {
    baseQuery.include.push(statusInclude);
  } else if (RoleEnum.BECARIO === userRole.roleName || userRole.roleName === RoleEnum.PASANTE) {
    baseQuery.include.push(
      {
        model: ProjectUser,
        as: "projectUsers",
        where: {
          projectUserUserId: userValidated.userId
        }
      },
      statusInclude
    );
  }

  const projects = await Project.findAll(baseQuery);
  return projects.map(mapProjectToDto);
}



export async function saveNewProject(userLoguedId: string, projectName: string, projectTypeId: string, startDate: string, endDate: string): Promise<Project> {

  //llamar a la funcion para validar al usuario Activo
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();
  if (!(userRole.roleName == RoleEnum.TUTOR)) { throw new ForbiddenAccessError(); }


  //Valido que el nombre ingresado no exista
  const projectExists = await Project.findOne({
    where: {
      projectName: projectName
    },
  });
  if (projectExists) { throw new NameUsedError() };
  //obtengo el tipo de proyecto ingresado
  const type = await ProjectType.findByPk(projectTypeId);
  if (!type) { throw new Error("No se encontró el estado ingresado"); }


  //obtengo el estado activo
  let status = await ProjectStatus.findOne({
    where: {
      "projectStatusName": ProjectStatusEnum.ACTIVE
    }
  });
  // console.log(status?.userStatusName)
  if (!status) {
    throw new Error("Estado no encontrado");

  }

  //creo el proyecto
  const newProject = await Project.build();
  newProject.projectName = projectName,
  newProject.projectStartDate = parse(startDate, 'dd-MM-yyyy', new Date()),
    newProject.projectEndDate = parse(endDate, 'dd-MM-yyyy', new Date()),
    newProject.createdDate = new Date(),
    newProject.updatedDate = new Date(),
    newProject.projectStatusId = status.projectStatusId
  newProject.projectTypeId = type.projectTypeId;

  await newProject.save()
  return newProject;
}




export async function getProject(userLoguedId: string, id: string): Promise<OneProjectDto> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();



  if (!(userValidated.userId === id || userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }
  //Busco el usuario para id seleccionado
  const project = await Project.findByPk(id, {

    include: [
      {
        model: ProjectStatus,
        attributes: ['projectStatusName']
      },
      {
        model: ProjectType,
        attributes: ['projectTypeName']
      }
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();

  }

  return mapOneProjectToDto(project);

}



export async function modifyProject(userLoguedId: string, projectId: string, name: string, description: string, objetive: string): Promise<Project | null> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  //Debe ser Becario o Pasante
  if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError()
  }


  //Validar que el usuario este asignado al proyecto
  await validateProjectMembership(userLoguedId, projectId);

  //Valido que el nombre ingresado no exista
  const projectExists = await Project.findOne({
    where: {
      projectName: name,
      projectId: { [Op.ne]: projectId } // excluye la etapa actual
    },
  });
  if (projectExists) { throw new NameUsedError() };

  //Debe estar en estado "Activo" o "Pendiente"
  const updatedProject = await Project.findOne({
    where: { "projectId": projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]
  });
  if (!updatedProject) {
    throw new NotFoundResultsError();
  }

  updatedProject.projectName = name;
  updatedProject.projectDescription = description;
  updatedProject.projectObjetive = objetive;
  updatedProject.updatedDate = new Date();


  await updatedProject.save(); // Guardar los cambios en la base de datos

  return updatedProject;
}



export async function lowproject(userLoguedId: string, projectId: string) {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }

  const deletedproject = await Project.findOne({
    where: { "projectId": projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]

  });
  if (!deletedproject) {
    throw new NotFoundResultsError();
  }

  //Buscar el estado Dado de baja
  const statusLow = await ProjectStatus.findOne({
    where: {
      'projectStatusName': ProjectStatusEnum.LOW
    }
  }
  );

  if (!statusLow) { throw new StatusNotFoundError() };

  deletedproject.setProjectStatus(statusLow.projectStatusId)
  deletedproject.deletedDate = new Date(); // Eliminar el usuario de la base de datos
  await deletedproject.save();
  return

}


export async function listMembers(userLoguedId: string, projectId: string) {
  const userValidated = await validateActiveUser(userLoguedId);


  const userRole = await userValidated.getRole();

  // Si no es tutor, verificar que esté asociado al proyecto
  if (userRole.roleName !== RoleEnum.TUTOR) {
    await validateProjectMembership(userLoguedId, projectId);
  }



  const project = await Project.findOne({
  where: {
    projectId: projectId,
  },
  include: [
    {
      model: ProjectStatus,
      attributes: ['projectStatusName'],
      required: true
    },
    {
      model: ProjectUser,
      as: 'projectUsers', // alias que usaste en Project.hasMany(ProjectUser)
      include: [
        {
          model: User,
          attributes: ['userFirstName', 'userLastName', 'userPersonalFile', 'userEmail'],
          include: [
            {
              model: Role,
              attributes: ['roleName'],
              required: true
            }
          ]
        }
      ]
    }
  ],
  order: [[{ model: ProjectUser, as: 'projectUsers' }, User, 'userFirstName', 'ASC']],

});


if (!project) {
    throw new NotFoundResultsError();
  }


  //     {
  //       model: User,
  //       attributes: ['userFirstName', 'userLastName', 'userPersonalFile', 'userEmail'],
  //       include: [{
  //         model: Role,
  //         attributes: ['roleName'],
  //         required: true
  //       }]
  //     }
  //   ]
  // });
  //console.log(JSON.stringify(members, null, 2)); // Verificá si aparece Role aquí
  const result = mapProjectToDetailsDto(project);
  return result

};


// export async function addMenmbers(userLoguedId: string, projectId: string, userId: string) {
//   const userValidated = await validateActiveUser(userLoguedId);


//   const userRole = await userValidated.getRole();

//   // debe ser tutor
//   if (!(userRole.roleName === RoleEnum.TUTOR)) {
//     throw new ForbiddenAccessError()
//   }

//   //valido el ussuario
//   const memberValidated = await validateActiveUser(userId);


//   //busco el proyecto
//   const project = await Project.findOne({
//     where: { "projectId": projectId },
//     include: [
//       {
//         model: ProjectStatus,
//         where: {
//           projectStatusName: {
//             [Op.or]: ["En progreso", "Activo"]
//           }
//         },
//       },
//     ]

//   });
//   if (!project) {
//     throw new NotFoundResultsError();
//   }

//   //Realizo la asignación
//   const projectUser = await ProjectUser.build();
//   projectUser.projectUserProjectId = project.projectId,
//     projectUser.projectUserUserId = memberValidated.userId,
//     projectUser.createdDate = new Date(),
//     projectUser.updatedDate = new Date(),

//     await projectUser.save();

//   return
// }
export async function addMenmbers(userLoguedId: string, projectId: string, userIds: string[]) {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    throw new ForbiddenAccessError();
  }

  // Validar existencia del proyecto y su estado
  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();
  }

  // Validar que los usuarios existan y estén activos
  const validatedUsers = await Promise.all(
    userIds.map(async (userId) => await validateActiveUser(userId))
  );

  // Crear asociaciones
  const projectUsersToCreate = validatedUsers.map(user => ({
    projectUserProjectId: project.projectId,
    projectUserUserId: user.userId,
    createdDate: new Date(),
    updatedDate: new Date()
  }));

  // Guardar en DB
  await ProjectUser.bulkCreate(projectUsersToCreate);

  //MANDAR EMAIL

  return;
}


export async function lowMember(userLoguedId: string, projectId: string, userId: string) {
  const userValidated = await validateActiveUser(userLoguedId);


  const userRole = await userValidated.getRole();

  // debe ser tutor
  if (!(userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }

  //valido el ussuario
  const memberValidated = await validateActiveUser(userId);


  //busco el proyecto
  const project = await Project.findOne({
    where: { "projectId": projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]

  });
  if (!project) {
    throw new NotFoundResultsError();
  }

  const oneProjectUser = await ProjectUser.findOne({
    where: {
      "projectUserProjectId": project.projectId,
      "projectUserUserId": memberValidated.userId,

    }
  });
  if (!oneProjectUser) {
    throw new NotFoundResultsError();
  }
  await oneProjectUser.destroy();
  return
}



export async function listStages(userLoguedId: string, projectId: string, pageNumber: number): Promise<ProjectStagesDto> {
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (userRole.roleName !== RoleEnum.TUTOR) {
    await validateProjectMembership(userLoguedId, projectId);
  }

  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();
  }

  const stageList = await Stage.findAll({
    where: { stageProjectId: project.projectId },
    include: [
      {
        model: StageStatus,
        attributes: ["stageStatusName"]
      },
      {
        model: Project,
        attributes: ["projectId", "projectName", "projectDescription", "projectObjetive", "projectStartDate", "projectEndDate"],
        include: [
          {
            model: ProjectStatus,
            attributes: ['projectStatusName'],
            required: true
          }
        ]
      }
    ],


    order: [["stageOrder", "ASC"]],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * pageNumber,
  });
  if (stageList.length === 0) {
    return mapToProjectStagesDto([]); // Devuelve el DTO vacío con datos del proyecto si querés
  }
  return mapToProjectStagesDto(stageList);
}



export async function addNewStage(userLoguedId: string, projectId: string, stageName: string, stageOrder: number) {
  //llamar a la funcion para validar al usuario Activo
  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();
  if (!(userRole.roleName == RoleEnum.BECARIO || userRole.roleName == RoleEnum.PASANTE)) { throw new ForbiddenAccessError(); }

  //Valido si es miembro
  await validateProjectMembership(userLoguedId, projectId);

  //Valido el proyecto ingresado
  const project = await Project.findOne({
    where: { projectId },
    include: [
      {
        model: ProjectStatus,
        where: {
          projectStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]
  });

  if (!project) {
    throw new NotFoundResultsError();
  }


  //Valido que el nombre ingresado no exista
  const stageExists = await Stage.findOne({
    where: {
      "stageName": stageName
    },
  });
  if (stageExists) { throw new NameUsedError() };

  //valido el orden
  const orderExist = await Stage.findOne({
    where: {
      "stageOrder": stageOrder
    }
  })
  if (orderExist) { throw new OrderExistsError() };

  //obtengo el estado pendiente
  let status = await StageStatus.findOne({
    where: {
      "stageStatusName": StageStatusEnum.PENDING
    }
  });
  // console.log(status?.userStatusName)
  if (!status) {
    throw new StatusNotFoundError();

  }

  //creo la etapa
  const newStage = await Stage.build();
  newStage.stageName = stageName,
    newStage.stageOrder = stageOrder,//validar
    newStage.createdDate = new Date(),
    newStage.updatedDate = new Date(),
    newStage.stageStatusId = status.stageStatusId,
    newStage.stageProjectId = project.projectId

  await newStage.save()
  return newStage;
}


//Función para validar si existe el usuario y si esta en estado activo

export async function validateActiveUser(userId: string): Promise<User> {

  const user = await User.findByPk(userId);
  if (!user) throw new UserNotFoundError();

  const userStatus = await user.getUserStatus();
  if (userStatus.userStatusName !== "Activo") {
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










export async function modifyStage(userLoguedId: string, stageId: string, stageName: string, stageOrder: number, status: string): Promise<Stage | null> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError()
  }

  //Obtener el proyecto a partir de la etapa
  //Valido el proyecto ingresado
  const stageUpdated = await Stage.findOne({
    where: { stageId },
    include: [
      {
        model: StageStatus,
        where: {
          stageStatusName: {
            [Op.or]: ["En progreso", "Pendiente"]
          }
        },
      },
    ]
  });

  if (!stageUpdated) {
    throw new NotFoundResultsError();
  }

  const pro = await stageUpdated.getProject();
  //Validar que este asignado al proyecto
  await validateProjectMembership(userLoguedId, pro.projectId);




  //Valido que el nombre ingresado no exista
  const stageNameExists = await Stage.findOne({
    where: {
      stagetName: stageName,
      stageProjectId: pro.projectId,
      stageId: { [Op.ne]: stageId } // excluye la etapa actual
    },
  });
  if (stageNameExists) { throw new NameUsedError() };


  //valido el orden
  const orderExist = await Stage.findOne({
    where: {
      "stageOrder": stageOrder,
      stageProjectId: pro.projectId,
      stageId: { [Op.ne]: stageId } // excluye la etapa actual

    }
  })
  if (orderExist) { throw new OrderExistsError() };

  //busco el esta ingresado
  const sendingStatus = await StageStatus.findOne({
    where: { "stageStatusName": status }
  })




  stageUpdated.stageName = stageName;
  stageUpdated.stageOrder = stageOrder;
  stageUpdated.setStageStatus(sendingStatus?.stageStatusId)
  stageUpdated.updatedDate = new Date();


  await stageUpdated.save(); // Guardar los cambios en la base de datos

  return stageUpdated;
}



export async function lowStage(userLoguedId: string, stageId: string) {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError()
  }

  const deletedStage = await Stage.findOne({
    where: { "stageId": stageId },
    include: [
      {
        model: StageStatus,
        where: {
          stagetStatusName: {
            [Op.or]: ["En progreso", "Activo"]
          }
        },
      },
    ]

  });
  if (!deletedStage) {
    throw new NotFoundResultsError();
  }

  //Obtener el id de proyecto a partir de la etapa

  const projectStage = await deletedStage.getProject();


  //Validar que este asignado al proyecto
  await validateProjectMembership(userLoguedId, projectStage.projectId);

  deletedStage.destroy;
  //ELIMINAR TODAS LAS TAREAS ASOCIADAS
  // //Buscar el estado Dado de baja
  // const statusLow = await ProjectStatus.findOne({
  //   where: {
  //     'projectStatusName': ProjectStatusEnum.LOW
  //   }
  // }
  // );

  // if (!statusLow) { throw new StatusNotFoundError() };


  // deletedproject.setProjectStatus(statusLow.projectStatusId)
  // deletedproject.deletedDate = new Date(); // Eliminar el usuario de la base de datos
  // await deletedproject.save();
  // return

}



export async function listProjectType(userLoguedId: string) {
  const userValidated = await validateActiveUser(userLoguedId);
  const projectType = await ProjectType.findAll();
  return projectType
}
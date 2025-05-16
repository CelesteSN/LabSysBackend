//import { add } from "winston";
import { Project } from "../models/project.model";
import bcrypt from "bcrypt";
import { ProjectStatus } from "../models/projectStatus.model";
import { ProjectStatusEnum } from "../enums/projectStatus.enum";
import { ProjectTypeEnum } from "../enums/projectType.enum";
import { ProjectType } from "../models/projectType.model";
import { randomUUID } from "crypto";
import { User } from "../models/user.model"
import { ForbiddenAccessError, UserNotFoundError, NameUsedError, NotFoundResultsError, StatusNotFoundError } from "../../../errors/customUserErrors";
import { RoleEnum } from "../../users/enums/role.enum";
import { Op } from "sequelize";
import { ProjectFilter } from "../dtos/projectFilters.dto";
import { AllProjectsDto, mapProjectToDto } from "../dtos/allProjects.dto";
import { appConfig } from "../../../config/app";
import { mapOneProjectToDto, OneProjectDto } from "../dtos/oneProjectResponse.dto";
import ProjectUser from "../models/projectUser.model";
import { mapToProjectMembersDto } from "../dtos/listMembers.dto";
import { Role } from "../models/role.model";

export async function listProjects(userLoguedId: string, filters: ProjectFilter): Promise<AllProjectsDto[]> {
  //llamar a la funcion para validar al usuario Activo
  const userValidated = await validateActiveUser(userLoguedId);
  // Construimos condiciones dinámicas
  const whereConditions: any = {};


  const statusRaw = filters?.status?.trim(); // elimina espacios
  const status = statusRaw ?? ProjectStatusEnum.INPROGRESS; // si no viene, usar "Pendiente"
  const isStatusAll = status.toLowerCase() === ProjectStatusEnum.ALL.toLowerCase();


  if (filters?.search) {
    whereConditions[Op.or] = [
      { projetName: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }
  const listProjects = await Project.findAll(
    {
      where: whereConditions,
      attributes: ['projectId', 'projectName', 'projectStartDate', 'projectEndDate'],
      include: [
        {
          model: ProjectStatus,
          attributes: ['projectStatusName'],
          ...(isStatusAll ? {} : { where: { "projectStatusName": status } })
        },
      ],
      order: [["createdDate", "ASC"]],
      limit: parseInt(appConfig.ROWS_PER_PAGE),
      offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
    });

  // if(listProjects.length == 0){throw new NotFoundResultsError()};
  return listProjects.map(mapProjectToDto);

}


export async function saveNewProject(userLoguedId: string, projectName: string, projectTypeId: string): Promise<Project> {

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



export async function modifyProject(userLoguedId: string, projectid: string, name: string, description: string, objetive: string): Promise<Project | null> {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName === RoleEnum.BECARIO || userRole.roleName === RoleEnum.PASANTE)) {
    throw new ForbiddenAccessError()
  }


  //Validar que este asignado al proyecto
  const member = await ProjectUser.findOne({
    where: {
      'projectUserProjectId': projectid,
      'projectUserUserId': userValidated.userId
    }
  });
  if (!member) { throw new ForbiddenAccessError() }


  //Validar que ese nombre no exista

  //Valido que el nombre ingresado no exista
  // const projectExists = await Project.findOne({
  //   where: {
  //     projectName: name
  //   },
  // });
  // if (projectExists) { throw new NameUsedError() };


  const updatedProject = await Project.findByPk(projectid);
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



export async function lowproject(userLoguedId: string , projectId: string) {

  const userValidated = await validateActiveUser(userLoguedId);
  const userRole = await userValidated.getRole();

  if (!(userRole.roleName === RoleEnum.TUTOR)) {
    throw new ForbiddenAccessError()
  }


  const deletedproject = await Project.findOne({
    where: {"projectId": projectId},
   include: [
      {
        model: ProjectStatus,
        where:{
          projectStatusName: {
            [Op.or]:["En progreso", "Activo"]
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
    where:{
      'projectStatusName': ProjectStatusEnum.LOW
    }
  }
  );

  if(!statusLow){ throw new StatusNotFoundError()};


   deletedproject.setProjectStatus(statusLow.projectStatusId)
    deletedproject.deletedDate = new Date(); // Eliminar el usuario de la base de datos
    await deletedproject.save();
    return

}


export async function listMembers(userLoguedId: string, projectId: string){
const userValidated = await validateActiveUser(userLoguedId);


 const userRole = await userValidated.getRole();

  // Si no es tutor, verificar que esté asociado al proyecto
  if (userRole.roleName !== RoleEnum.TUTOR) {
    const isMember = await ProjectUser.findOne({
      where: {
        projectUserProjectId: projectId,
        projectUserUserId: userLoguedId
      }
    });

    if (!isMember) {
      throw new ForbiddenAccessError("No tiene permiso para ver los miembros de este proyecto.");
    }
  }


const members = await ProjectUser.findAll({
  where: {
    "projectUserProjectId": projectId ,
  },

      include: [
        {
          model: Project,
          attributes: ['projectId','projectName'] 
        },
        {
          model: User,
          attributes: ['userFirstName', 'userLastName', 'userPersonalFile', 'userEmail'],
          include: [{model: Role,
            attributes: ['roleName'],
            required: true
          }]
  
        }
      ]
    });
  //console.log(JSON.stringify(members, null, 2)); // Verificá si aparece Role aquí
    const result = mapToProjectMembersDto(members);
    return result
  
};





//Función para validar si existe el usuario y si esta en estado activo

export async function validateActiveUser( userId: string): Promise<User> {
  
  const user = await User.findByPk(userId);
  if (!user) throw new UserNotFoundError();

  const userStatus = await user.getUserStatus();
  if (userStatus.userStatusName !== "Activo") {
    // throw Errors.forbiddenAccessError("El usuario no está activo");
    throw new ForbiddenAccessError();
  }

  return user;
}
import { catchAsync } from "../../../utils/catchAsync";
import { AllProjectsDto } from "../dtos/allProjects.dto";
import { ProjectFilter } from "../dtos/projectFilters.dto";
import { ProjectStatusEnum } from "../enums/projectStatus.enum";
import { ProjectType } from "../models/projectType.model";
import { listProjects, saveNewProject, getProject, modifyProject, lowproject, listMembers, addMenmbers, lowMember, listStages, addNewStage, lowStage, modifyStage, listProjectType, getAvailableUsersForProject } from "../services/project.service";
import { Request, Response } from "express";


export async function getAllProjects(req: Request, res: Response) {
  const { userLoguedId } = (req as any).user;
  const pageNumber = parseInt(req.query.pageNumber as string) || 0;

  const filters: ProjectFilter = {
    pageNumber,
    search: req.query.search as string,
    status: req.query.status as ProjectStatusEnum || undefined,
  };
  const projects: AllProjectsDto[] = await listProjects(userLoguedId, filters);

  if (projects.length === 0) {
    return res.status(200).json({
      success: true,
      pageNumber,
      message: 'No se encontraron resultados',
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    pageNumber,
    data: projects,
  });
};




export async function createProject(req: Request, res: Response): Promise<void> {

  const { userLoguedId } = (req as any).user;
  const projectName = req.body.projectName;
  const projectTypeId = req.body.projectTypeId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const newProject = await saveNewProject(userLoguedId, projectName, projectTypeId, startDate, endDate);
  res.status(201).json({
    success: true,
    message: "El proyecto ha sido creado exitosamente."
  });
}




export const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const project = await getProject(userLoguedId, projectId);
  res.status(200).json({
    success: true,
    data: project
  });
});



export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const projectName = req.body.projectName;
  const description = req.body.description;
  const objetive = req.body.objetive;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;


  const user = await modifyProject(userLoguedId, projectId, projectName, description, objetive, startDate, endDate );
  res.status(200).json({
    success: true,
    message: "El proyecto ha sido modificado exitosamente"
  })

});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const { userLoguedId } = (req as any).user;
  await lowproject(userLoguedId, projectId);
  res.status(200).json({
    success: true,
    message: "El proyecto ha sido dado de baja exitosamente"
  })
})


export const getMembers = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const members = await listMembers(userLoguedId, projectId);


  if (!members.members || members.members.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No se encontraron resultados",
      data: members,
    });
  }
  return res.status(200).json({
    success: true,
    //pageNumber,
    data: members,
  });
})


export const addMemberToProject = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const userIds: string[] = req.body.userIds;
  await addMenmbers(userLoguedId, projectId, userIds);
  if(userIds.length == 1){
res.status(201).json({
    success: true,
    message: "Usuario asignado al proyecto exitosamente, se le ha enviado un email notificandolo."
  });
  }else{
    res.status(201).json({
    success: true,
    message: "Usuarios asignados al proyecto exitosamente, se les ha enviado un email notificandolos."
  });
  }
})

export const deleteMemberToProject = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const userId = req.body.userId;
  await lowMember(userLoguedId, projectId, userId);
  res.status(201).json({
    success: true,
    message: "El usuario ha sido desvinculado del proyecto exitosamente."
  });
})


export const getAllStages = catchAsync(async (req: Request, res: Response) => {

  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const pageNumber = parseInt(req.query.pageNumber as string) || 0;
  const stageList = await listStages(userLoguedId, projectId, pageNumber);

  if (stageList.stages.length === 0) {
    return res.status(200).json({
      success: true,
      pageNumber,
      message: 'No se encontraron etapas asociadas al proyecto.',
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    pageNumber,
    data: stageList,
  });
})


export async function createStage(req: Request, res: Response): Promise<void> {

  const { userLoguedId } = (req as any).user;
  const projectId = req.params.projectId;
  const stageName = req.body.stageName;
  const stageOrder = req.body.stageOrder;
  
  const newProject = await addNewStage(userLoguedId, projectId, stageName, stageOrder);
  res.status(201).json({
    success: true,
    message: "La etapa ha sido creada exitosamente."
  });
}


export const updateStage = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const stagetId = req.params.stageId;
  const stageName = req.body.stageName;
  const stageOrder = req.body.stageOrder;
  


  const user = await modifyStage(userLoguedId, stagetId, stageName, stageOrder);
  res.status(200).json({
    success: true,
    messaje: "La etapa ha sido modificada exitosamente"
  })

});


export const deleteStageToProject = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const stageId = req.params.stageId;
  await lowStage(userLoguedId, stageId);
  res.status(201).json({
    success: true,
    message: "La etapa ha sido eliminada exitosamente."
  });
})

export const getAllProjectType = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectTypeList = await listProjectType(userLoguedId);
  if (projectTypeList.length === 0) {
    return res.status(200).json({
      success: true,
      // pageNumber,
      message: 'No se encontraron tipos de proyecto.',
    });
  }

  return res.status(200).json({
    success: true,
    //pageNumber,
    data: projectTypeList,
  });
})


export const getAllUsersProject = catchAsync(async(req: Request, res: Response)=>{
  const { userLoguedId } = (req as any).user;
    const pageNumber = parseInt(req.query.pageNumber as string) || 0;
   const projectId = req.params.projectId;
   const usersList = await getAvailableUsersForProject(userLoguedId , projectId, pageNumber);
    if (usersList.length === 0) {
    return res.status(200).json({
      success: true,
      pageNumber,
      message: 'No se encontraron usuarios.',
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    pageNumber,
    data: usersList,
  });
})
import { catchAsync } from "../../../utils/catchAsync";
import { AllProjectsDto } from "../dtos/allProjects.dto";
import { ProjectFilter } from "../dtos/projectFilters.dto";
import { ProjectStatusEnum } from "../enums/projectStatus.enum";
import { listProjects, saveNewProject, getProject, modifyProject, lowproject, listMembers } from "../services/project.service";
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
      mensaje: 'No se encontraron resultados',
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
  const newProject = await saveNewProject(userLoguedId, projectName, projectTypeId);
  res.status(201).json({
    success: true,
    message: "El proyecto ha sido creado exitosamente."
  });
}




export const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.id;
  const project = await getProject(userLoguedId, projectId);
  res.status(200).json({
    success: true,
    data: project
  });
});



export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const projectId = req.params.id;
  const projectName = req.body.projectName;
  const description = req.body.description;
  const objetive = req.body.objetive;


  const user = await modifyProject(userLoguedId, projectId, projectName, description, objetive);
  res.status(200).json({
    success: true,
    messaje: "El proyecto ha sido modificado exitosamente"
  })

});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const { userLoguedId } = (req as any).user;
  await lowproject(userLoguedId, projectId);
  res.status(200).json({
    success: true,
    messaje: "El proyecto ha sido dado de baja exitosamente"
  })
})


export const getMembers = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const  projectId  = req.params.id;
  const members = await listMembers(userLoguedId, projectId);
  
if (members.members.length === 0) {
    return res.status(200).json({
      success: true,
      mensaje: "No se encontraron resultados"
    });
  }


  return res.status(200).json({
    success: true,
    //pageNumber,
    data: members,
  });
})
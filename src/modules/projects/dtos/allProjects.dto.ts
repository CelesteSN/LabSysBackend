import { Project } from "../models/project.model";

export type AllProjectsDto = {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
};

export function mapProjectToDto(project: Project): AllProjectsDto {
  return {
    id: project.projectId,
    name: project.projectName,
    startDate: project.projectStartDate ?? null,
    endDate: project.projectEndDate ?? null,
    status: project.ProjectStatus.projectStatusName
  };
}

    //   createdDate: user.createdDate.toLocaleDateString('es-AR', {
    //     day: '2-digit',
    //     month: '2-digit',
    //     year: 'numeric',
    // })
    // };
    
  

  

 // const formattedDate = date.toISOString().split('T')[0];
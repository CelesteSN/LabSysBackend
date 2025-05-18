import { Project } from "../models/project.model";
import { format } from 'date-fns';


export type AllProjectsDto = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
};

export function mapProjectToDto(project: Project): AllProjectsDto {
  return {
    id: project.projectId,
    name: project.projectName,
    startDate: formatDate(project.projectStartDate),
    endDate: formatDate(project.projectEndDate),
    status: project.ProjectStatus.projectStatusName
  };
}



function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd-MM-yyyy');
}


import { Project } from "../models/project.model";
import { format } from 'date-fns';


export type AllProjectsDto = {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
};

export function mapProjectToDto(project: Project): AllProjectsDto {
  return {
    id: project.projectId,
    name: project.projectName,
    startDate: formatDate(project.projectStartDate),
    endDate: formatDate(project.projectEndDate),

    // startDate: project.projectStartDate ?? null,
    //endDate: project.projectEndDate ?? null,
    status: project.ProjectStatus.projectStatusName
  };
}



function formatDate(date: Date | string | null): string | null {
  if (!date) return null;
  return format(new Date(date), 'dd-MM-yyyy');
}


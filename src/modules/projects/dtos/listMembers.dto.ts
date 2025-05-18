

 import {Project} from "../models/project.model";
import { format } from 'date-fns';


export type ProjectDetailsDto = {
  id: string;
  projectName: string;
  description?: string | '';
  objetive?: string |'';
  startDate: string;
  endDate: string;
  status: string; // Nombre del estado del proyecto
  members: ProjectMemberDto[]; // Lista de miembros
};

export type ProjectMemberDto = {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userPersonalFile: string;
  userEmail: string;
  roleName: string;
};


export function mapProjectToDetailsDto(project: Project): ProjectDetailsDto {
  return {
    id: project.projectId,
    projectName: project.projectName,
    description: project.projectDescription || '',
    objetive: project.projectObjetive || '',
    startDate: formatDate(project.projectStartDate),
    endDate:formatDate(project.projectEndDate) ,
    status: project.ProjectStatus.projectStatusName,
    members: (project.projectUsers ?? []).map(pu => ({
      userId: pu.User.userId,
      userFirstName: pu.User.userFirstName,
      userLastName: pu.User.userLastName,
      userPersonalFile: pu.User.userPersonalFile,
      userEmail: pu.User.userEmail,
      roleName: pu.User.Role.roleName
    }))
  };
}
function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd-MM-yyyy');
}
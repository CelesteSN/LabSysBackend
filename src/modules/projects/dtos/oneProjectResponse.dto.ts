import { Project } from "../models/project.model";
import { format } from 'date-fns';


export type OneProjectDto = {
    id: string;
    projectName: string;
    description?: string;
    objetive?: string;
    startDate: string;
    endDate: string;
    status: string;
    projectType: string
    createdDate: string
};

export function mapOneProjectToDto(project: Project): OneProjectDto {
    return {
        id: project.projectId,
        //name: `${user.userFirstName} ${user.userLastName}`,
        projectName: project.projectName,
        description: project.projectDescription || "",
        objetive: project.projectObjetive || "",
        startDate: formatDate(project.projectStartDate),
        endDate: formatDate(project.projectEndDate),
        status: project.ProjectStatus.projectStatusName,
        projectType: project.ProjectType.projectTypeName,
          createdDate: formatDate(project.createdDate)
    };
}
function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd-MM-yyyy');
}

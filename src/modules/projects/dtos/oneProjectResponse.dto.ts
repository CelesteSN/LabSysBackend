import { Project } from "../models/project.model";


export type OneProjectDto = {
    id: string;
    projectName: string;
    description?: string;
    objetive?: string;
    startDate?: Date;
    endDate?: Date;
    status: string;
    projectType: string
    createdDate: string
};

export function mapOneProjectToDto(project: Project): OneProjectDto {
    return {
        id: project.projectId,
        //name: `${user.userFirstName} ${user.userLastName}`,
        projectName: project.projectName,
        description: project.projectDescription || undefined,
        objetive: project.projectObjetive || undefined,
        startDate: project.projectStartDate || undefined,
        status: project.ProjectStatus.projectStatusName,
        projectType: project.ProjectType.projectTypeName,
          createdDate: project.createdDate.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    };
}

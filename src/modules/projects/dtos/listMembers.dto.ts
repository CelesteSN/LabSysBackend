// import ProjectUser from "../models/projectUser.model";

// export type MemberDto = {
//   userFirstName: string;
//   userLastName: string;
//   userEmail: string;
//   userPersonalFile: string;
//   role: string;
// };

// export type ProjectMembersDto = {
//   projectId?: string;
//   projectName: string;
//   projectDescription: string;
//   projectObjective: string;
//   startDate: Date | null;
//   endDate: Date | null;
//   status: string;
//   members: MemberDto[];
// };

// export function mapToProjectMembersDto(projectUsers: ProjectUser[]): ProjectMembersDto {
//   if (projectUsers.length === 0) {
//     return {
//       projectId: "",
//       projectName: "",
//       projectDescription: "",
//       projectObjective: "",
//       startDate: null,
//       endDate: null,
//       status: "",
//       members: []
//     };
//   }

//   const project = projectUsers[0].Project;

//   const projectId = project?.projectId ?? "";
//   const projectName = project?.projectName ?? "";
//   const projectDescription = project?.projectDescription ?? "";
//   const projectObjective = project?.projectObjetive ?? "";
//   const startDate = project?.projectStartDate ?? null;
//   const endDate = project?.projectEndDate ?? null;
//   const status = project?.ProjectStatus?.projectStatusName ?? "";

//   const members: MemberDto[] = projectUsers.map((pu) => ({
//     userFirstName: pu.User?.userFirstName ?? "",
//     userLastName: pu.User?.userLastName ?? "",
//     userEmail: pu.User?.userEmail ?? "",
//     userPersonalFile: pu.User?.userPersonalFile ?? "",
//     role: pu.User?.Role?.roleName ?? ""
//   }));

//   return {
//     projectId,
//     projectName,
//     projectDescription,
//     projectObjective,
//     startDate,
//     endDate,
//     status,
//     members
//   };
// }

 import {Project} from "../models/project.model";


export type ProjectDetailsDto = {
  projectId: string;
  projectName: string;
  projectDescription?: string | null;
  projectObjetive?: string | null;
  projectStartDate?: Date | null;
  projectEndDate?: Date | null;
  projectStatus: string; // Nombre del estado del proyecto
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
    projectId: project.projectId,
    projectName: project.projectName,
    projectDescription: project.projectDescription,
    projectObjetive: project.projectObjetive,
    projectStartDate: project.projectStartDate ? new Date(project.projectStartDate) : null,
    projectEndDate: project.projectEndDate ? new Date(project.projectEndDate) : null,
    projectStatus: project.ProjectStatus.projectStatusName,
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

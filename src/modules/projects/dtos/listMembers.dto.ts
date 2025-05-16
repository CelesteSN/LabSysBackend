import ProjectUser from "../models/projectUser.model";

export type MemberDto = {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPersonalFile: string;
  role: string;
};

export type ProjectMembersDto = {
   projectId?: string;
  projectName: string;
  members: MemberDto[];
};

export function mapToProjectMembersDto(projectUsers: ProjectUser[]): ProjectMembersDto {
  if (projectUsers.length === 0) {
    return {
      projectId: "",
      projectName: "",
      members: []
    };
  }

  const projectName = projectUsers[0].Project?.projectName ?? "Sin nombre";
  const projectId = projectUsers[0].Project?.projectId ?? "";

  const members: MemberDto[] = projectUsers.map((pu) => ({
    userFirstName: pu.User?.userFirstName ?? "",
    userLastName: pu.User?.userLastName ?? "",
    userEmail: pu.User?.userEmail ?? "",
    userPersonalFile: pu.User?.userPersonalFile ?? "",
    role: pu.User?.Role?.roleName ?? ""
  }));

  return {
    projectId,
    projectName,
    members
  };
}

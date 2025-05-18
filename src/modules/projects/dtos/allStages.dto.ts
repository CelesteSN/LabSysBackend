// import  Stage  from "../models/stage.model";

// export type AllStagesDto = {
//   id: string;
//   stageName: string;
//   stageOrder: number;
//   status: string;
//   startDate?: Date | null;
//   endDate?: Date | null;
//   progress: number;
// };

// export function mapStageToDto(stage: Stage): AllStagesDto {
//   return {
//     id: stage.stageId,
//     stageName: stage.stageName,
//     stageOrder: stage.stageOrder,
//     status: stage.StageStatus.stageStatusName,
//     startDate: stage.stageStartDate ?? null,
//     endDate: stage.stageEndDate ?? null,
//     progress: stage.stageProgress
//   };
// }

//     //   createdDate: user.createdDate.toLocaleDateString('es-AR', {
//     //     day: '2-digit',
//     //     month: '2-digit',
//     //     year: 'numeric',
//     // })
//     // };
    
  

  

//  // const formattedDate = date.toISOString().split('T')[0];


// DTOs

export type StageDto = {
  stageId: string;
  stageName: string;
  stageOrder: number;
  stageProgress: number;
  startDate: string | null; // string porque está formateada
  endDate: string | null;
  status: string | null;
};

export type ProjectStagesDto = {
  projectId?: string;
  projectName: string;
  projectDescription: string;
  projectObjective: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  stages: StageDto[];
};

// Mapper

import Stage from "../models/stage.model";

export function mapToProjectStagesDto(stages: Stage[]): ProjectStagesDto {
  if (stages.length === 0) {
    return {
      projectId: "",
      projectName: "",
      projectDescription: "",
      projectObjective: "",
      startDate: null,
      endDate: null,
      status: "",
      stages: []
    };
  }

  const project = stages[0].Project;

  const projectId = project?.projectId ?? "";
  const projectName = project?.projectName ?? "";
  const projectDescription = project?.projectDescription ?? "";
  const projectObjective = project?.projectObjetive ?? "";
  const startDate = project?.projectStartDate ?? null;
  const endDate = project?.projectEndDate ?? null;
  const projectStatus = project?.ProjectStatus?.projectStatusName ?? "";

  const stageDtos: StageDto[] = stages.map((s) => ({
    stageId: s.stageId,
    stageName: s.stageName,
    stageOrder: s.stageOrder,
    stageProgress: s.stageProgress,
    startDate: s.stageStartDate ? s.stageStartDate.toLocaleDateString("es-AR") : null,
    endDate: s.stageEndDate ? s.stageEndDate.toLocaleDateString("es-AR") : null,
    status: s.StageStatus?.stageStatusName ?? null
  }));

  return {
    projectId,
    projectName,
    projectDescription,
    projectObjective,
    startDate,
    endDate,
    status: projectStatus,
    stages: stageDtos
  };
}


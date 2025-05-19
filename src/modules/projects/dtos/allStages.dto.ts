import  Stage  from "../models/stage.model";
import { format } from 'date-fns';

export type AllStagesDto = {
  id: string;
  stageOrder: number;
  stageName: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  progress: number;
};

export function mapStageToDto(stage: Stage): AllStagesDto {
  return {
    id: stage.stageId,
    stageName: stage.stageName,
    stageOrder: stage.stageOrder,
    status: stage.StageStatus.stageStatusName,
    startDate: formatDate(stage.stageStartDate),
    endDate: formatDate(stage.stageEndDate),
    progress: stage.stageProgress
  };
}


function formatDate(date: Date | string | null): string | null {
  if (!date) return null;
  return format(new Date(date), 'dd-MM-yyyy');
}
//     //   createdDate: user.createdDate.toLocaleDateString('es-AR', {
//     //     day: '2-digit',
//     //     month: '2-digit',
//     //     year: 'numeric',
//     // })
//     // };
    
  

  

//  // const formattedDate = date.toISOString().split('T')[0];


// DTOs

// export type StageDto = {
//   stageId: string;
//   stageName: string;
//   stageOrder: number;
//   stageProgress: number;
//   startDate: string; // string porque está formateada
//   endDate: string;
//   status: string;
// };

// export type ProjectStagesDto = {
//   projectId?: string;
//   // projectName: string;
//   // projectDescription: string;
//   // projectObjective: string;
//   // startDate: Date | null;
//   // endDate: Date | null;
//   // status: string;
//   stages: StageDto[];
// };

// // Mapper

// import Stage from "../models/stage.model";
// import { format } from 'date-fns';


// export function mapToProjectStagesDto(stages: Stage[]): ProjectStagesDto {
//   if (stages.length === 0) {
//     return {
//       projectId: project.p,
//       // projectName: "",
//       // projectDescription: "",
//       // projectObjective: "",
//       // startDate: null,
//       // endDate: null,
//       // status: "",
//       stages: []
//     };
//   }

//   const project = stages[0].Project;

//   const projectId = project?.projectId ?? "";
//   // const projectName = project?.projectName ?? "";
//   // const projectDescription = project?.projectDescription ?? "";
//   // const projectObjective = project?.projectObjetive ?? "";
//   // const startDate = project?.projectStartDate ?? null;
//   // const endDate = project?.projectEndDate ?? null;
//   // const projectStatus = project?.ProjectStatus?.projectStatusName ?? "";

//   const stageDtos: StageDto[] = stages.map((s) => ({
//     stageId: s.stageId,
//     stageName: s.stageName,
//     stageOrder: s.stageOrder,
//     stageProgress: s.stageProgress,
//    startDate: formatDate(s.stageStartDate),
//     endDate: formatDate(s.stageEndDate),
//     status: s.StageStatus?.stageStatusName ?? null
//   }));

//   return {
//     projectId,
//     // projectName,
//     // projectDescription,
//     // projectObjective,
//     // startDate,
//     // endDate,
//     // status: projectStatus,
//     stages: stageDtos
//   };
// }

// function formatDate(date: Date | string): string {
//   return format(new Date(date), 'dd-MM-yyyy');
// }
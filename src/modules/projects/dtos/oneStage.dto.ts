import  Stage  from "../models/stage.model";
import { format } from 'date-fns';


export type OneStageDto = {
    stageId: string;
    stageName: string;
    stageOrder: number;
    stageStartDate?: string;
    stageEndDate?: string;
    stageStatus: string;
    stageProgress?: number;
    createdDate: string
};

export function mapOneStageToDto(stage: Stage): OneStageDto {
    return {
        stageId: stage.stageId,
        //name: `${user.userFirstName} ${user.userLastName}`,
        stageName: stage.stageName,
        stageOrder: stage.stageOrder,
        stageStartDate: formatDate(stage.stageStartDate),
        stageEndDate: formatDate(stage.stageEndDate),
        stageStatus: stage.StageStatus.stageStatusName,
        stageProgress: stage.stageProgress|| 0,
        createdDate: formatDate(stage.createdDate)
    };
}
function formatDate(date: Date | string | null): string {
    if(date == null){
        return "00-00-0000"
    }
  return format(new Date(date), 'dd-MM-yyyy');

}

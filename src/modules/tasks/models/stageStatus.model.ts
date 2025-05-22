import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';


export class StageStatus extends Model{
declare stageStatusId: string;
declare stageStatusName: string;
declare stageStatusValue: number;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
StageStatus.init(
    {
        stageStatusId:{
        field: "stage_status_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    stageStatusName:{
        type: DataTypes.STRING,
        field: "stage_status_name",
        allowNull: false
    },
    stageStatusValue:{
        type: DataTypes.STRING,
        field: "stage_status_name",
        allowNull: false
    },
       createdDate:{
        type: DataTypes.DATE,
        field: "created_date",
        allowNull:false
    },
    updatedDate:{
        type: DataTypes.DATE,
        field: "updated_date",
        allowNull:false
    }, 
    deletedDate:{
        type: DataTypes.DATE,
        field: "deleted_date",
        allowNull: true
    }
    },
    {
        sequelize,
        modelName: 'StageStatus',
        tableName: 'stage_status',
        timestamps: false,
      }
    );


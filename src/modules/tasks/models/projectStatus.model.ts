import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';


export class ProjectStatus extends Model{
declare projectStatusId: string;
declare projectStatusName: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
ProjectStatus.init(
    {
        projectStatusId:{
        field: "project_status_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    projectStatusName:{
        type: DataTypes.STRING,
        field: "project_status_name",
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
        modelName: 'ProjectStatus',
        tableName: 'project_status',
        timestamps: false,
      }
    );


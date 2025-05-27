import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';


export class TaskStatus extends Model{
declare taskStatusId: string;
declare taskStatusName: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
TaskStatus.init(
    {
        taskStatusId:{
        field: "task_status_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    taskStatusName:{
        type: DataTypes.STRING,
        field: "task_status_name",
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
        modelName: 'TaskStatus',
        tableName: 'task_status',
        timestamps: false,
      }
    );


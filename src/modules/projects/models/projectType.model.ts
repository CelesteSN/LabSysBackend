import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';


export class ProjectType extends Model{
declare projectTypeId: string;
declare projectTypeName: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
ProjectType.init(
    {
        projectTypeId:{
        field: "project_type_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    projectTypeName:{
        type: DataTypes.STRING,
        field: "project_type_name",
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
        modelName: 'ProjectType',
        tableName: 'project_type',
        timestamps: false,
      }
    );


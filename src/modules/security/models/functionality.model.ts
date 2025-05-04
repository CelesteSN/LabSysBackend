import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';


export class Functionality extends Model{
declare functionalityId: string;
declare functionalityName: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;



}
Functionality.init(
    {
        functionalityId:{
        field: "functionality_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    functionalityName:{
        type: DataTypes.STRING,
        field: "functionality_name",
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
        modelName: 'Functionality',
        tableName: 'functionality',
        timestamps: false,
      }
    );

  
      
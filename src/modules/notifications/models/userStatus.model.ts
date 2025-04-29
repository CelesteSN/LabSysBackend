import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';


export class UserStatus extends Model{
declare userStatusId: string;
declare userStatusName: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
UserStatus.init(
    {
    userStatusId:{
        field: "user_status_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    userStatusName:{
        type: DataTypes.STRING,
        field: "user_status_name",
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
        modelName: 'UserStatus',
        tableName: 'user_status',
        timestamps: false,
      }
    );


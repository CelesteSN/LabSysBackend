import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';

export class Role extends Model{
declare roleId: string;
declare roleName: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
Role.init(
    {
        roleId:{
        field: "role_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    roleName:{
        type: DataTypes.STRING,
        field: "role_name",
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
        modelName: 'Role',
        tableName: 'role',
        timestamps: false,
      }
    );


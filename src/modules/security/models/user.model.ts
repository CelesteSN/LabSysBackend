
import {
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    DataTypes,
    Model,
    UUIDV4,
  } from "sequelize";
  import { sequelize } from '../../../config/database';
  import { UserStatus } from "./userStatus.model";
  import { Role } from "./role.model";
  
  export class User extends Model {
    declare userId: string;
    declare userFirstName: string;
    declare userLastName: string;
    declare userPassword: string;
    declare userEmail: string;
    declare userPersonalFile: string;
    declare createdDate: Date;
    declare updatedDate: Date;
    declare deletedDate?: Date | null;
  
    // Foreign keys
    declare userStatusId: string;
    declare userRoleId: string;
  
    // Associations (referencias completas)
    declare UserStatus: UserStatus;
    declare Role: Role;
  
    // Métodos generados por Sequelize para las relaciones
    declare getUserStatus: BelongsToGetAssociationMixin<UserStatus>;
    declare setUserStatus: BelongsToSetAssociationMixin<UserStatus, UserStatus['userStatusId']>;
    declare createUserStatus: BelongsToCreateAssociationMixin<UserStatus>;
  
    declare getRole: BelongsToGetAssociationMixin<Role>;
    declare setRole: BelongsToSetAssociationMixin<Role, Role['roleId']>;
    declare createRole: BelongsToCreateAssociationMixin<Role>;
  }
  
  User.init({
    userId: {
      field: "user_id",
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    userFirstName: {
      field: "user_first_name",
      type: DataTypes.STRING,
      allowNull: false
    },
    userLastName: {
      field: "user_last_name",
      type: DataTypes.STRING,
      allowNull: false
    },
    userPassword: {
      field: "user_password",
      type: DataTypes.STRING,
      allowNull: false
    },
    userEmail: {
      field: "user_email",
      type: DataTypes.STRING,
      allowNull: false
    },
    userPersonalFile: {
      field: "user_personal_file",
      type: DataTypes.STRING,
      allowNull: false
    },
    createdDate: {
      field: "created_date",
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedDate: {
      field: "updated_date",
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedDate: {
      field: "deleted_date",
      type: DataTypes.DATE,
      allowNull: true
    },
    userStatusId: {
      field: "user_user_status_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    userRoleId: {
      field: "user_role_id",
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false
  });

  User.belongsTo(UserStatus, {
    targetKey: "userStatusId",
    foreignKey: 'user_user_status_id'
  });
  
  User.belongsTo(Role, {
    targetKey: "roleId",
    foreignKey: 'user_role_id',
  });
  
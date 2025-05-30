import { Model, DataTypes, BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,Optional, UUIDV4 } from "sequelize";
  import { sequelize } from '../../../config/database';
  import { Task } from "../../projects/models/task.model";
import { User } from "../../projects/models/user.model";



export class Attachment extends Model {
  declare attachmentId: string;
  declare attachmentFileName: string;
  declare attachmentFileLink: string;
  declare attachmentDescription?: string;
  declare attachmentMimeType: string;
  declare createdDate: Date;
  declare updatedDate: Date;
  declare deletedDate?: Date;
  declare attachmentTaskId: string;
  declare attachmentUserId: string;


  declare User: User;
  declare Task: Task

   declare getUser: BelongsToGetAssociationMixin<User>;
      declare setUser: BelongsToSetAssociationMixin<User, User['userId']>;
      declare createUser: BelongsToCreateAssociationMixin<User>;
  
       declare getTask: BelongsToGetAssociationMixin<Task>;
      declare setTask: BelongsToSetAssociationMixin<Task, Task['taskId']>;
      declare createTask: BelongsToCreateAssociationMixin<Task>;
}





Attachment.init(
  {
    attachmentId: {
      field: "attachment_id",
      type: DataTypes.UUID,
      primaryKey: true,
       defaultValue: UUIDV4
      
    },
    attachmentFileName: {
      field: "attachment_file_name",
      type: DataTypes.STRING,
      allowNull: false
    },
    attachmentFileLink: {
      field: "attachment_file_link",
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachmentDescription: {
      field: "attachment_description",
      type: DataTypes.STRING,
      allowNull: true
    },
    attachmentMimeType: {
      field: "attachment_mime_type",
      type: DataTypes.STRING,
      allowNull: false
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: false,
        field: 'created_date'

    },
    updatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
        field: 'updated_date'

    },
    deletedDate: {
      type: DataTypes.DATE,
      allowNull: true,
        field: 'deleted_date'

    },
    attachmentTaskId: {
     field: "attachment_task_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    attachmentUserId: {
    field: "attachment_user_id",
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Attachment",
    tableName: "attachment",
    timestamps: false // porque usamos nuestros propios campos de fecha
  }
);


Attachment.belongsTo(Task, { foreignKey: "attachment_task_id" });
Task.hasMany(Attachment, { foreignKey: "attachment_task_id" });

Attachment.belongsTo(User, { foreignKey: "attachment_user_id" });
User.hasMany(Attachment, { foreignKey: "attachment_user_id" });

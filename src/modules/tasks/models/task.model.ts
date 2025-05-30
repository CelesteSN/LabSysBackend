
import {
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    DataTypes,
    Model,
    UUIDV4,
  } from "sequelize";
  import { sequelize } from '../../../config/database';
  import { TaskStatus } from "./taskStatus.model";
 import { User } from "./user.model";
 import  Stage  from "./stage.model";

  
  export class Task extends Model {
    declare taskId: string;
    declare taskTitle: string;
    declare taskDescription?: string | null;
    declare taskPriority?: number| null;
    declare taskOrder: number;
    declare taskStartDate: Date;
    declare taskEndDate: Date;

    

   // declare projectEndDate: Date;
    //declare projectStartDate: Date;

    declare createdDate: Date;
    declare updatedDate: Date;
    declare deletedDate?: Date | null;
  
    // Foreign keys
    declare taskUserId: string;
    declare taskStatusId: string;
    declare taskStageId: string;

  
    // Associations (referencias completas)
    declare TaskStatus: TaskStatus;
    declare User: User;
    declare Stage: Stage;
  
    // Métodos generados por Sequelize para las relaciones
    declare getTaskStatus: BelongsToGetAssociationMixin<TaskStatus>;
    declare setTaskStatus: BelongsToSetAssociationMixin<TaskStatus, TaskStatus['taskStatusId']>;
    declare createTaskStatus: BelongsToCreateAssociationMixin<TaskStatus>;
  
    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, User['userId']>;
    declare createUser: BelongsToCreateAssociationMixin<User>;

    declare getStage: BelongsToGetAssociationMixin<Stage>;
    declare setStage: BelongsToSetAssociationMixin<Stage, Stage['stageId']>;
    declare createStage: BelongsToCreateAssociationMixin<Stage>;
  }
  
  Task.init({
    taskId: {
      field: "task_id",
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    taskTitle: {
      field: "task_title",
      type: DataTypes.STRING,
      allowNull: false
    },
    taskDescription: {
      field: "task_description",
      type: DataTypes.STRING,
      allowNull: true
    },
    taskPriority: {
      field: "task_priority",
      type: DataTypes.INTEGER,
      allowNull: true
    },
    taskOrder: {
      field: "task_order",
      type: DataTypes.INTEGER,
      allowNull: false
    },

   
    taskStartDate: {
      field: "task_start_date",
      type: DataTypes.DATE,
      allowNull: false
    },
    taskEndDate: {
      field: "task_end_date",
      type: DataTypes.DATE,
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
    taskStatusId: {
      field: "task_status_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    taskUserId: {
      field: "task_user_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    taskStageId: {
      field: "task_stage_id",
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'task',
    timestamps: false
  });

  Task.belongsTo(TaskStatus, {
    //targetKey: "project_status_id",
    foreignKey: 'taskStatusId'
  });
  
  Task.belongsTo(User, {
    //targetKey: "ptoject_type_id",
    foreignKey: 'taskUserId',
  });
  Task.belongsTo(Stage, {
    //targetKey: "ptoject_type_id",
    foreignKey: 'taskStageId',
    onDelete: 'CASCADE',
  });

  Stage.hasMany(Task,{
    //targetKey: "ptoject_type_id",
    foreignKey: 'taskStageId',
  });

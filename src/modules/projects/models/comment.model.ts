
import {
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    DataTypes,
    Model,
    UUIDV4,
  } from "sequelize";
  import { sequelize } from '../../../config/database';
  import { Task } from "./task.model";
  import { CommentType } from "./commentType.model";
    import { User } from "./user.model"; 

  
  export class Comment extends Model {
    declare commentId: string;
    declare commentDetail: string;

    declare createdDate: Date;
    declare updatedDate: Date;
    declare deletedDate?: Date | null;
  
    // Foreign keys
    declare commentTypeId: string;
    declare commentUserId: string;
    declare commentTaskId: string;

  
    // Associations (referencias completas)
    declare User: User;
    declare CommentType: CommentType;
    declare Task: Task;
  
    // Métodos generados por Sequelize para las relaciones
    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, User['userId']>;
    declare createUser: BelongsToCreateAssociationMixin<User>;
  
    declare getCommentType: BelongsToGetAssociationMixin<CommentType>;
    declare setCommentType: BelongsToSetAssociationMixin<CommentType, CommentType['commentTypeId']>;
    declare createCommentType: BelongsToCreateAssociationMixin<CommentType>;

     declare getTask: BelongsToGetAssociationMixin<Task>;
    declare setTask: BelongsToSetAssociationMixin<Task, Task['taskId']>;
    declare createTask: BelongsToCreateAssociationMixin<Task>;
  }
  
  Comment.init({
    commentId: {
      field: "comment_id",
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    commentDetail: {
      field: "comment_detail",
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
    commentTaskId: {
      field: "comment_task_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    commentTypeId: {
      field: "comment_type_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    commentUserId:{
      field: "comment_user_id",
      type: DataTypes.UUID,
      allowNull: false   
    }

  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comment',
    timestamps: false
  });

  Comment.belongsTo(Task, {
    foreignKey: 'comment_task_id',
      onDelete: 'CASCADE',

  });
  
  Comment.belongsTo(CommentType, {
    foreignKey: 'comment_type_id',
  });
  Comment.belongsTo(User, {
    foreignKey: 'comment_user_id',
  });
  
Comment.hasMany(User, {
  foreignKey: 'comment_user_id', // este es el campo FK en ProjectUser que apunta a Project
  //as: 'projectUsers' // alias que vas a usar en los includes
});

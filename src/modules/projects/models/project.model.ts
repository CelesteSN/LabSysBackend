
import {
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    DataTypes,
    Model,
    UUIDV4,
  } from "sequelize";
  import { sequelize } from '../../../config/database';
  import { ProjectStatus } from "./projectStatus.model";
  import { ProjectType } from "./projectType.model";
  
  export class Project extends Model {
    declare projectId: string;
    declare projectName: string;
    declare projectDescription?: string | null;
    declare projectObjetive?: string| null;
    declare projectStartDate?: string| null;
    declare projectEndDate?: string | null;
    declare createdDate: Date;
    declare updatedDate: Date;
    declare deletedDate?: Date | null;
  
    // Foreign keys
    declare projectTypeId: string;
    declare projectStatusId: string;
  
    // Associations (referencias completas)
    declare ProjectStatus: ProjectStatus;
    declare ProjectType: ProjectType;
  
    // Métodos generados por Sequelize para las relaciones
    declare getProjectStatus: BelongsToGetAssociationMixin<ProjectStatus>;
    declare setProjectStatus: BelongsToSetAssociationMixin<ProjectStatus, ProjectStatus['projectStatusId']>;
    declare createProjectStatus: BelongsToCreateAssociationMixin<ProjectStatus>;
  
    declare getProjectType: BelongsToGetAssociationMixin<ProjectType>;
    declare setProjectType: BelongsToSetAssociationMixin<ProjectType, ProjectType['projectTypeId']>;
    declare createProjectType: BelongsToCreateAssociationMixin<ProjectType>;
  }
  
  Project.init({
    projectId: {
      field: "project_id",
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    projectName: {
      field: "project_name",
      type: DataTypes.STRING,
      allowNull: false
    },
    projectDescription: {
      field: "project_description",
      type: DataTypes.STRING,
      allowNull: true
    },
    projectObjetive: {
      field: "project_objetive",
      type: DataTypes.STRING,
      allowNull: true
    },
    projectStartDate: {
      field: "project_start_date",
      type: DataTypes.STRING,
      allowNull: true
    },
    projectEndDate: {
      field: "project_end_date",
      type: DataTypes.STRING,
      allowNull: true
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
    projectStatusId: {
      field: "project_status_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    projectTypeId: {
      field: "project_type_id",
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'project',
    timestamps: false
  });

  Project.belongsTo(ProjectStatus, {
    //targetKey: "project_status_id",
    foreignKey: 'project_status_id'
  });
  
  Project.belongsTo(ProjectType, {
    //targetKey: "ptoject_type_id",
    foreignKey: 'project_type_id',
  });
  
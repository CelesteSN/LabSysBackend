import {
  Model,
  DataTypes,
  UUIDV4,
  BelongsToSetAssociationMixin,
  BelongsToGetAssociationMixin
} from "sequelize";
import { sequelize } from "../../../config/database";
import {Project} from "./project.model";
import {StageStatus} from "./stageStatus.model";

class Stage extends Model {
  declare stageId: string;
  declare stageName: string;
  declare stageOrder: number;
  declare stageProgress: number;
  declare stageStartDate: Date | null;
  declare stageEndDate: Date | null;
  declare createdDate: Date;
  declare updatedDate: Date;
  declare deletedDate: Date | null;
  declare stageProjectId: string;
  declare stageStatusId: string;

  declare StageStatus: StageStatus;
  declare Project: Project

  // Relaciones
  declare getProject: BelongsToGetAssociationMixin<Project>;
  declare setProject: BelongsToSetAssociationMixin<Project, Project["projectId"]>;

  declare getStageStatus: BelongsToGetAssociationMixin<StageStatus>;
  declare setStageStatus: BelongsToSetAssociationMixin<StageStatus, StageStatus["stageStatusId"]>;
}

Stage.init(
  {
    stageId: {
      field: "stage_id",
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true
    },
    stageName: {
      field: "stage_name",
      type: DataTypes.STRING(100),
      allowNull: false
    },
    stageOrder: {
      field: "stage_order",
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stageProgress: {
      field: "stage_progress",
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    stageStartDate: {
      field: "stage_start_date",
      type: DataTypes.DATE,
      allowNull: true,
     
    },
    stageEndDate: {
      field: "stage_end_date",
      type: DataTypes.DATE,
      allowNull: true,
     
    },
    stageProjectId: {
      field: "stage_project_id",
      type: DataTypes.UUID,
      allowNull: false
    },
    stageStatusId: {
      field: "stage_status_id",
      type: DataTypes.UUID,
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
    }
  },
  {
    sequelize,
    modelName: "Stage",
    tableName: "stage",
    timestamps: false
  }
);

// Relaciones
Stage.belongsTo(Project, {
  foreignKey: "stageProjectId"
});
Project.hasMany(Stage, {
  foreignKey: "stageProjectId"
});

Stage.belongsTo(StageStatus, {
  foreignKey: "stageStatusId"
});
StageStatus.hasMany(Stage, {
  foreignKey: "stageStatusId"
});

export default Stage;

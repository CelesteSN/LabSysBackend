import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from '../../../config/database';
import {User} from "./user.model";
import {Project } from "./project.model";

class ProjectUser extends Model {
    declare id: string;
    declare projectUserProjectId: string;
    declare projectUserUserId: string;
    declare Project: Project;
    declare User: User;
    declare createdDate: Date;
    declare updatedDate: Date;
    declare deletedDate?: Date |null;



    declare getPProjectUserProject: BelongsToGetAssociationMixin<Project>
    declare setProjectUserProject: BelongsToSetAssociationMixin<Project, Project['projectId']>

    declare getRProjectUserUser: BelongsToGetAssociationMixin<User>
    declare setProjectUserUser: BelongsToSetAssociationMixin<User, User['userId']>

}

ProjectUser.init({
    id: {
        field: "project_user_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    projectUserProjectId:{ 
        field: "project_user_project_id",
        type: DataTypes.UUID,
        allowNull: false
    },
    projectUserUserId: {
        field: "project_user_user_id",
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
    },
        
},
    {
    
                sequelize,
                modelName: 'ProjectUser',
                tableName: 'project_user',
                timestamps: false,
    }       
);

// ProjectUser.belongsTo(Project, {
//     foreignKey: "projectUserProjectId"
// });
ProjectUser.belongsTo(User,{
    foreignKey: "projectUserUserId"
});


User.hasMany(ProjectUser, { foreignKey: 'projectUserUserId' });


export default ProjectUser;




import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from '../../../config/database';
import {Role} from "./role.model";
import {Functionality } from "./functionality.model";

class RoleFunctionality extends Model {
    declare id: string;
    declare roleFunctionalityFunctionalityId: string;
    declare roleFunctionalityRoleId: string;
    declare Functionality: Functionality;
    declare Role: Role;


    declare getProfileFunctionalityFunctionality: BelongsToGetAssociationMixin<Functionality>
    declare setProfileFunctionalityFunctionality: BelongsToSetAssociationMixin<Functionality, Functionality['functionalityId']>

    declare getRoleFunctionalityRoleId: BelongsToGetAssociationMixin<Role>
    declare setRoleFunctionalityRoleId: BelongsToSetAssociationMixin<Role, Role['roleId']>

}

RoleFunctionality.init({
    id: {
        field: "role_functionality_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    roleFunctionalityFunctionalityId:{ 
        field: "functionality_id",
        type: DataTypes.UUID,
        allowNull: false
    },
    roleFunctionalityRoleId: {
        field: "role_id",
        type: DataTypes.UUID,
        allowNull: false},
        
},
    {
    
                sequelize,
                modelName: 'RoleFunctionality',
                tableName: 'role_functionality',
                timestamps: false,
    }       
);

RoleFunctionality.belongsTo(Role, {
    foreignKey: "role_id"
});
RoleFunctionality.belongsTo(Functionality,{
    foreignKey: "functionality_id"
});

export default RoleFunctionality;



// import {BelongsToCreateAssociationMixin,
//     BelongsToGetAssociationMixin,
//     BelongsToSetAssociationMixin, DataTypes, Model, UUIDV4} from "sequelize";
// import { sequelize } from '../../../config/database';
// import { Role } from "./role.model";
// import { Functionality } from "./functionality.model";


// export class RoleFunctionality extends Model{
// declare createdDate: Date;
// declare updatedDate: Date;
// declare deletedDate?: Date | null;



// Foreign keys

// declare roleId: string
// declare functionalityId:string
  
//     Associations (referencias completas)
//     declare Functionality: Functionality;
//     declare Role: Role;
  
//     Métodos generados por Sequelize para las relaciones
//     declare getFunctionality: BelongsToGetAssociationMixin<Functionality>;
//     declare setFunctionality: BelongsToSetAssociationMixin<Functionality, Functionality['functionalityId']>;
//     declare createFunctionality: BelongsToCreateAssociationMixin<Functionality>;
  
//     declare getRole: BelongsToGetAssociationMixin<Role>;
//     declare setRole: BelongsToSetAssociationMixin<Role, Role['roleId']>;
//     declare createRole: BelongsToCreateAssociationMixin<Role>;

// }
// RoleFunctionality.init(
//     {

//         roleFunctionalityId: {
//             field: "role_functionality_id",
//             type: DataTypes.UUID,
//             primaryKey: true,
//             defaultValue: DataTypes.UUIDV4
//           },
//           roleId: {
//             field: "role_id",
//             type: DataTypes.UUID,
//             allowNull: false
//           },
//           functionalityId: {
//             field: "functionality_id",

//             type: DataTypes.UUID,
//             allowNull: false
//           },
//        createdDate:{
//         type: DataTypes.DATE,
//         field: "created_date",
//         allowNull:false
//     },
//     updatedDate:{
//         type: DataTypes.DATE,
//         field: "updated_date",
//         allowNull:false
//     }, 
//     deletedDate:{
//         type: DataTypes.DATE,
//         field: "deleted_date",
//         allowNull: true
//     }
//     },
//     {
//         sequelize,
//         modelName: 'RoleFunctionality',
//         tableName: 'role_functionality',
//         timestamps: false,
//       }
//     );

//     Role.belongsToMany(Functionality, {
//   through: RoleFunctionality,
//   foreignKey: 'roleId',
//   otherKey: 'functionalityId'
// });

// Functionality.belongsToMany(Role, {
//   through: RoleFunctionality,
//   foreignKey: 'functionalityId',
//   otherKey: 'roleId'
// });

// RoleFunctionality.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
// RoleFunctionality.belongsTo(Functionality, { foreignKey: 'functionalityId', as: 'Functionality' });
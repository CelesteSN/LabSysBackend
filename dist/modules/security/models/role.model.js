"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../../config/database");
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    roleId: {
        field: "role_id",
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.UUIDV4
    },
    roleName: {
        type: sequelize_1.DataTypes.STRING,
        field: "role_name",
        allowNull: false
    },
    createdDate: {
        type: sequelize_1.DataTypes.DATE,
        field: "created_date",
        allowNull: false
    },
    updatedDate: {
        type: sequelize_1.DataTypes.DATE,
        field: "updated_date",
        allowNull: false
    },
    deletedDate: {
        type: sequelize_1.DataTypes.DATE,
        field: "deleted_date",
        allowNull: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Role',
    tableName: 'role',
    timestamps: false,
});

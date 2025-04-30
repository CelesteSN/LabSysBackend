"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../../config/database");
const userStatus_model_1 = require("./userStatus.model");
const role_model_1 = require("./role.model");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    userId: {
        field: "user_id",
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.UUIDV4
    },
    userFirstName: {
        field: "user_first_name",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userLastName: {
        field: "user_last_name",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userDni: {
        field: "user_dni",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userPhoneNumber: {
        field: "user_phone_number",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userPassword: {
        field: "user_password",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userEmail: {
        field: "user_email",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userPersonalFile: {
        field: "user_personal_file",
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userDisabledReason: {
        field: "user_disabled_reason",
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    createdDate: {
        field: "created_date",
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedDate: {
        field: "updated_date",
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    deletedDate: {
        field: "deleted_date",
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    userStatusId: {
        field: "user_user_status_id",
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    userRoleId: {
        field: "user_role_id",
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false
});
User.belongsTo(userStatus_model_1.UserStatus, {
    targetKey: "userStatusId",
    foreignKey: 'user_user_status_id'
});
User.belongsTo(role_model_1.Role, {
    targetKey: "roleId",
    foreignKey: 'user_role_id',
});

import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from '../../../config/database';
import {User} from "./user.model";

export class PasswordRecovery extends Model {
    declare passwordRecoveryId: string;
    declare passwordRecoveryToken: string;
    declare expirationDate: Date;
    declare readDate?: Date | null;
    declare createdDate: Date;

//  Foreign keys
    declare passwordRecoveryUserId: string;

 // Associations (referencias completas)
    declare passwordUser: User;


    declare getPasswordUser: BelongsToGetAssociationMixin<User>
    declare setPasswordUser: BelongsToSetAssociationMixin<User, User['userId']>
}

PasswordRecovery.init({
    passwordRecoveryId: {
            field: "password_recovery_id",
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: UUIDV4,
        },
    passwordRecoveryToken: {
        field: "password_recovery_token",
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: UUIDV4,
        },
        expirationDate: {
            field: "expiration_date",
            type: DataTypes.DATE,
        },
        createdDate:{
            field: "created_date",
            type: DataTypes.DATE,
        }, 
        readDate:{
            field: "read_date",
            type: DataTypes.DATE,
            allowNull: true

        },
        passwordRecoveryUserId: {
            field: "password_recovery_user_id",
            type: DataTypes.UUID

        }
    },
    {
        sequelize,
        modelName: "PasswordRecovery",
        tableName: "password_recovery",
        timestamps: false
    });

PasswordRecovery.belongsTo(User, {
    targetKey: "userId",
    foreignKey: "password_recovery_user_id",
    as: "passwordUser"


});

User.hasMany(PasswordRecovery,{
    foreignKey: "password_recovery_user_id"
});

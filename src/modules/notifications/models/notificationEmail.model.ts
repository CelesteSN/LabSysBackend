import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, UUIDV4 } from "sequelize";
import { sequelize } from '../../../config/database';
import {NotificationTemplate} from '../models/notificationTemplate.model';
import {User} from '../models/user.model';

export class NotificationEmail extends Model{
declare notificationEmailId: string;

declare createdDate: Date;

declare notificationEmailUserId: string;
declare notificationEmailNotTemplateId: string;


declare NotificationTemplate: NotificationTemplate;
declare User: User;


declare getNotificationTemplate: BelongsToGetAssociationMixin<NotificationTemplate>
declare setNotificationTemplate: BelongsToSetAssociationMixin<NotificationTemplate, NotificationTemplate['notificationTemplateId']>

declare getRProjectUserUser: BelongsToGetAssociationMixin<User>
declare setProjectUserUser: BelongsToSetAssociationMixin<User, User['userId']>
}
NotificationEmail.init(
    {
        notificationEmailId:{
        field: "notification_email_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    notificationEmailUserId:{
        type: DataTypes.UUID,
        field: "notification_user_id",
        allowNull: false
    },
notificationEmailNotTemplateId:{
        type: DataTypes.UUID,
        field: "notification_template_id",
        allowNull: false
    },
       createdDate:{
        type: DataTypes.DATE,
        field: "created_date",
        allowNull:false
    },
   
    },
    {
        sequelize,
        modelName: 'NotificationEmail',
        tableName: 'notification_email',
        timestamps: false,
      }
    );

NotificationEmail.belongsTo(User,{
    foreignKey: "notificationUserId"
});

NotificationEmail.belongsTo(NotificationEmail,{
    foreignKey: "notificationTemplateId"
});

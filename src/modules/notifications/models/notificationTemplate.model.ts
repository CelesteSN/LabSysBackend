import { DataTypes, Model, UUIDV4} from "sequelize";
import { sequelize } from '../../../config/database';

export class NotificationTemplate extends Model{
declare notificationTemplateId: string;
declare notificationTemplateName: string;
declare notificationTemplateDescription: string;
declare notificationTemplatelinkRedirect: string;
declare notificationTemplateEmailSubject: string;
declare createdDate: Date;
declare updatedDate: Date;
declare deletedDate?: Date | null;


}
NotificationTemplate.init(
    {
        notificationTemplateId:{
        field: "notification_template_id",
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    notificationTemplateName:{
        type: DataTypes.STRING,
        field: "notification_template_name",
        allowNull: false
    },
notificationTemplateDescription:{
        type: DataTypes.TEXT,
        field: "notification_template_description",
        allowNull: false
    },


notificationTemplatelinkRedirect:{
        type: DataTypes.STRING,
        field: "link_redirect",
        allowNull: false
    },


notificationTemplateEmailSubject:{
        type: DataTypes.STRING,
        field: "email_subject",
        allowNull: false
    },
       createdDate:{
        type: DataTypes.DATE,
        field: "created_date",
        allowNull:false
    },
    updatedDate:{
        type: DataTypes.DATE,
        field: "updated_date",
        allowNull:false
    }, 
    deletedDate:{
        type: DataTypes.DATE,
        field: "deleted_date",
        allowNull: true
    }
    },
    {
        sequelize,
        modelName: 'NotificationTemplate',
        tableName: 'notification_template',
        timestamps: false,
      }
    );


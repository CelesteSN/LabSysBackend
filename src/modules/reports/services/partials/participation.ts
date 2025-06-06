import { Op } from "sequelize";
import { User } from "../../../tasks/models/user.model";
import { Role } from "../../../tasks/models/role.model";
import ProjectUser from "../../../tasks/models/projectUser.model";
import { Task } from "../../../tasks/models/task.model";
import Stage from "../../../tasks/models/stage.model";
import { Comment } from "../../../tasks/models/comment.model";
import { Attachment } from "../../../tasks/models/attachment.model";
import { RoleEnum } from "../../../tasks/enums/role.enum";

export async function getUserParticipation(
  projectId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<{ name: string; count: number }[]> {
  const dateFilter: any = {};
  if (fromDate && toDate) {
    dateFilter.createdDate = { [Op.between]: [fromDate, toDate] };
  }

  // 1. Obtener los IDs de usuarios asignados al proyecto
  const userLinks = await ProjectUser.findAll({
    where: { projectUserProjectId: projectId },
  });

  const userIds = userLinks.map(l => l.projectUserUserId);

  // 2. Obtener usuarios que son becarios/pasantes
  const users = await User.findAll({
    where: {
      userId: { [Op.in]: userIds }
    },
    attributes: ["userId", "userFirstName", "userLastName"],
    include: [
      {
        model: Role,
        required: true,
        where: {
          roleName: { [Op.in]: [RoleEnum.BECARIO, RoleEnum.PASANTE] }
        },
        attributes: []
      }
    ]
  });

  // 3. Recolectar participación por usuario (comentarios + archivos)
  const participation = await Promise.all(users.map(async user => {
    const [comments, attachments] = await Promise.all([
      Comment.count({
        where: {
          commentUserId: user.userId,
          ...dateFilter
        },
        include: [{
          model: Task,
          required: true,
          include: [{
            model: Stage,
            required: true,
            where: { stageProjectId: projectId }
          }]
        }]
      }),
      Attachment.count({
        where: {
          attachmentUserId: user.userId,
          ...dateFilter
        },
        include: [{
          model: Task,
          required: true,
          include: [{
            model: Stage,
            required: true,
            where: { stageProjectId: projectId }
          }]
        }]
      })
    ]);

    return {
      name: `${user.userFirstName} ${user.userLastName}`,
      count: comments + attachments
    };
  }));

  return participation;
}

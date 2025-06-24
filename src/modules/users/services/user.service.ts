//import { add } from "winston";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { UserStatus } from "../models/userStatus.model";
import { UserStatusEnum } from "../enums/userStatus.enum"
import { RoleEnum } from "../enums/role.enum";
import { Role } from "../models/role.model";
import { randomUUID } from "crypto";
import { mapUserToDto } from "../dtos/allUsers.dto";
import { AllUsersDto } from "../dtos/allUsers.dto";
import { EmailAlreadyExistsError, RoleNotFoundError, StatusNotFoundError, UserNotFoundError, ForbiddenError, ForbiddenAccessError, UserAlreadyDeletedError } from '../../../errors/customUserErrors';
import { UserFilter } from "../dtos/userFilters.dto";
import { Op, where } from 'sequelize';
import { mapOneUserToDto, OneUserDto } from "../dtos/oneUserResponse.dto";
import { renderTemplate, sendEmail } from '../../notifications/services/notification.service';
import { AllRoleDto, mapRoleToDto } from '../dtos/allRole.dto';
import { ResponseUserEnum } from "../enums/responseUser.enum";
import { appConfig } from "../../../config/app";
import { NotificationTemplate } from "../../notifications/models/notificationTemplate.model";
import { NotificationEmail } from "../../notifications/models/notificationEmail.model";




/**
 * Obtiene una lista paginada de usuarios visibles para un usuario logueado con rol de Tutor,
 * aplicando filtros opcionales de búsqueda, fechas, estado y rol.
 * 
 * Proceso detallado:
 * - Valida que el usuario logueado exista y esté activo.
 * - Verifica que el rol del usuario logueado sea "Tutor".
 * - Construye condiciones dinámicas según los filtros:
 *    - `search`: búsqueda por nombre o apellido (insensible a mayúsculas/minúsculas).
 *    - `fromDate` / `toDate`: filtra usuarios por fecha de creación.
 *    - `status`: filtra por estado del usuario (por defecto, "Pendiente").
 *    - `role`: filtra por rol (si no se especifica, excluye el rol "Tutor").
 * - Ejecuta una consulta con paginación y orden por fecha de creación ascendente.
 * - Retorna la lista mapeada a DTOs (`AllUsersDto[]`).
 * 
 * @param userLoguedId - ID del usuario que realiza la consulta.
 * @param page - Número de página para la paginación.
 * @param filters - Filtros opcionales para búsqueda, fechas, estado y rol.
 * @throws UserNotFoundError si el usuario no existe o no está activo.
 * @throws ForbiddenAccessError si el usuario logueado no tiene rol "Tutor".
 * @returns Lista de usuarios como DTOs.
 */



export async function listUsers(userLoguedId: string, filters: UserFilter): Promise<AllUsersDto[]> {
  const userValidated = await validateActiveUser(userLoguedId);
  const roleUser = await userValidated.getRole();

  if (roleUser?.roleName !== RoleEnum.TUTOR) {
    throw new ForbiddenAccessError();
  }

  // Normalizar entradas
  const search = filters?.search?.trim();
  const role = filters?.role?.trim();
  const status = filters?.status?.trim();

  const applySearch = !!search && search.length >= 3;
  const applyRole = !!role;
  const applyStatus = !!status;

  // WHERE principal (User)
  const where: any = {};

  // 🔍 Search: por nombre o apellido (mínimo 3 letras)
  if (applySearch) {
    where[Op.or] = [
      { userFirstName: { [Op.iLike]: `%${search}%` } },
      { userLastName: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // 👥 Include (UserStatus y Role)
  const include: any[] = [];

  // Estado
  include.push({
    model: UserStatus,
    attributes: ["userStatusName"],
    ...(applyStatus ? { where: { userStatusName: status }, required: true } : { required: false })
  });

  // Rol (siempre se excluye TUTOR, incluso si no hay filtro de rol)
  include.push({
    model: Role,
    attributes: ["roleName"],
    where: {
      [Op.and]: [
        ...(applyRole ? [{ roleName: role }] : []),
        { roleName: { [Op.not]: RoleEnum.TUTOR } }
      ]
    },
    required: true
  });

  const users = await User.findAll({
    where,
    include,
    attributes: ["userId", "userFirstName", "userLastName", "createdDate"],
    order: [["createdDate", "DESC"]],
    limit: parseInt(appConfig.ROWS_PER_PAGE),
    offset: parseInt(appConfig.ROWS_PER_PAGE) * filters.pageNumber,
  });

  return users.map(mapUserToDto);
}




export async function addUser(firstName: string, lastName: string, dni: string, password: string, email: string, personalFile: string, roleId: string, phone_number?: string): Promise<User> {
    //Valido que el usuario nio exista
    const existingUser = await User.findOne({ where: { "user_email": email } });
    if (existingUser) {
        // throw new Error("El correo electrónico ya está en uso");
        throw new EmailAlreadyExistsError();

    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //busco el estado pendiente
    let status = await UserStatus.findOne({
        where: {
            "user_status_name": UserStatusEnum.PENDING
        }
    });
    // console.log(status?.userStatusName)
    if (!status) {
        //throw new Error("Estado no encontrado");
        throw new StatusNotFoundError();



    }
    //Valido que el rol ingresadoeste en la DB
    let role = await Role.findByPk(roleId);
    if (!role) {
        throw new Error("Rol no encontrado");
    }
    //creo el usuario
    const newUser = await User.build({
        //newUser.userId = randomUUID(),
        userFirstName: formatName(firstName),
        userLastName: formatName(lastName),
        userDni: dni,
        userEmail: formatEmail(email),
        userPassword: hashedPassword,
        userPersonalFile: personalFile,
        createdDate: new Date(),
        updatedDate: new Date(),
        userStatusId: status.userStatusId,
        userRoleId: role.roleId,
        userPhoneNumber: phone_number ?? undefined  // <-- solo si tenés que pasarlo opcional

    });


    await newUser.save()
    return newUser;
}


export async function getUser(userLoguedId: string, id: string): Promise<OneUserDto> {


    //Bloque para validar usuario existente y activo
    // const loguedUser = await User.findByPk(userLoguedId);
    // if (!loguedUser) {
    //     throw new UserNotFoundError();
    // }

    // const userLoguedStatus = await loguedUser.getUserStatus();

    // if (!(userLoguedStatus.userStatusName == UserStatusEnum.ACTIVE)) {
    //     throw new Error("No puede accedr a esta funcionalidad")
    // }
    const userValidated = await validateActiveUser(userLoguedId);
    const userValidateRole = await userValidated.getRole();
    const allowedRoles = [RoleEnum.TUTOR, RoleEnum.BECARIO, RoleEnum.PASANTE];

    if (!allowedRoles.includes(userValidateRole.roleName as RoleEnum)) {
        throw new ForbiddenAccessError();
    }

    //Busco el usuario para id seleccionado
    const user = await User.findByPk(id, {

        include: [
            {
                model: Role,
                attributes: ['roleName']
            },
            {
                model: UserStatus,
                attributes: ['userStatusName']
            }
        ]
    });

    if (!user) {
        throw new UserNotFoundError();

    }

    return mapOneUserToDto(user);


}


export async function addAnswer(userLoguedId: string, userId: string, response: ResponseUserEnum, comment?: string) {
    const userValidated = await validateActiveUser(userLoguedId);
    const roleUser = await userValidated.getRole();
    if (roleUser?.roleName != RoleEnum.TUTOR) {
        throw new ForbiddenAccessError();

    };
    //Obtengo el usuario al que le quiero responder la solicitud de alta
    const userPending = await User.findByPk(userId, {
        include: [
            {
                model: UserStatus,
                attributes: ['userStatusName'],
                where: {
                    userStatusName: UserStatusEnum.PENDING
                    // Solo usuarios en estado Pending
                }
            },
        ]
    })

    if (!userPending) {
        throw new UserNotFoundError();
    }


    const userPendingRole = userPending.getRole()
    //Lo acepto en la plataforma
    if (response == ResponseUserEnum.ACCEPTED) {
        const activeStatus = await UserStatus.findOne({
            where: {
                'userStatusName': UserStatusEnum.ACTIVE
            }
        }

        )
        userPending.setUserStatus(activeStatus?.userStatusId)
        userPending.updatedDate = new Date()
        userPending.save();


        // Obtener plantilla de respuesta a usuario pendiente
          const template = await NotificationTemplate.findOne({
            where: { notificationTemplateName: "ANSWER_ACCEPT_USER_PENDING"}
          });
        
          if (!template) {
            throw new Error("Plantilla de recuperación de contraseña no encontrada");
          }
        
          // Construir el cuerpo con reemplazos
         // const recoveryLink = `https://tu-app.com/reset-password/${token}`;
         const html = await renderTemplate(template.notificationTemplateDescription, {
        userFirstName: userPending.userFirstName,
        userLastName: userPending.userLastName,
        roleName: (await userPendingRole).roleName,
        linkRedirect: template.notificationTemplatelinkRedirect
});

        
             await sendEmail(userPending.userEmail, template.notificationTemplateEmailSubject, html);
        
          // Crear notificación de email
          await NotificationEmail.create({
            notificationEmailUserId: userPending.userId,
            notificationEmailNotTemplateId: template.notificationTemplateId,
            //emailTo: user.userEmail,
            //emailStatus: "PENDING",
            createdDate: new Date(),
            //emailSubject: template.emailSubject,
            //emailHtml: html // campo opcional si querés guardar el cuerpo ya procesado
          });
    }
    else {
        //No lo acepto en la plataforma

      
        const rejectedStatus = await UserStatus.findOne({
            where: {
                'userStatusName': UserStatusEnum.REJECTED
            }
        }

        )
        userPending.setUserStatus(rejectedStatus?.userStatusId);
        userPending.updatedDate = new Date();
        userPending.userDisabledReason = comment;
        userPending.save();




        // Obtener plantilla de respuesta a usuario pendiente
          const template = await NotificationTemplate.findOne({
            where: { notificationTemplateName: "ANSWER_REJECT_USER_PENDING" }
          });
        
          if (!template) {
            throw new Error("Plantilla de recuperación de contraseña no encontrada");
          }
        
          // Construir el cuerpo con reemplazos
         
        const html = await renderTemplate(template.notificationTemplateDescription, {
        userFirstName: userPending.userFirstName,
        userLastName: userPending.userLastName,
        roleName: (await userPendingRole).roleName,
        comment: userPending.userDisabledReason,
});

        
        await sendEmail(userPending.userEmail, template.notificationTemplateEmailSubject, html);
        
        // Crear notificación de email
        await NotificationEmail.create({
        notificationEmailUserId: userPending.userId,
        notificationEmailNotTemplateId: template.notificationTemplateId,
            //emailTo: user.userEmail,
            //emailStatus: "PENDING",
            createdDate: new Date(),
            //emailSubject: template.emailSubject,
            //emailHtml: html // campo opcional si querés guardar el cuerpo ya procesado
          });
       
    }

}
//}

export async function modifyUser(userLoguedId: string, id: string, firstName: string, lastName: string, email: string, personalFile: string, dni: string, phone_number?: string): Promise<User | null> {

    // const user = await User.findByPk(id);
    // if (!user) {
    //     return null; // Usuario no encontrado
    // }
    // const userStatus = await user.getUserStatus();
    const userValidated = await validateActiveUser(userLoguedId);

    if (!(userLoguedId == id)) { throw new ForbiddenAccessError(); }


    userValidated.userFirstName = firstName;
    userValidated.userLastName = lastName;
    userValidated.userEmail = email;
    if (phone_number) {
        userValidated.userPhoneNumber = phone_number;
    }
    userValidated.userDni = dni;
    userValidated.userPersonalFile = personalFile;

    //   if (password !== undefined && password.trim() !== '') {
    //     user.userPassword = await bcrypt.hash(password, 10);
    //   }

    userValidated.updatedDate = new Date();

    await userValidated.save(); // Guardar los cambios en la base de datos

    return userValidated;
}



export async function lowUser(userLoguedId: string, id: string): Promise<void> {
    // try {
    //     const user = await User.findByPk(id);
    //     if (!user) {
    //         throw new Error("Usuario no encontrado");
    //     }

    //     const userStatus = await user.getUserStatus();
    //     if (!(userStatus.userStatusName == UserStatusEnum.ACTIVE && userLoguedId == id)) { throw new Error("No puede acceder a este recurso") }

    const userValidated = await validateActiveUser(userLoguedId);
    const userValidatedRole = await userValidated.getRole();
    if (!(userLoguedId == id || userValidatedRole.roleName == RoleEnum.TUTOR)) { throw new ForbiddenAccessError(); }
    //busco el estado "Eliminado"
    const userStatusLow = await UserStatus.findOne({
        where: {
            userStatusName: UserStatusEnum.DELETED,

        }
    })
    if (!userStatusLow) { throw new StatusNotFoundError(); };

    const userLow = await User.findOne({
        where: {
            userId: id
        },
        include: [
            {
                model: UserStatus,
                where: {
                    userStatusName: {
                        [Op.ne]: UserStatusEnum.DELETED
                    }
                }
            }
        ]

    }
    );
    if (!userLow) { throw new UserAlreadyDeletedError(); };

    userLow.setUserStatus(userStatusLow.userStatusId)
    userLow.deletedDate = new Date(); 
    await userLow.save();
    return

}


export async function allRoleService(): Promise<AllRoleDto[]> {
    const allRole = await Role.findAll({
        where: {
            roleName: {
                [Op.not]: 'Tutor' // excluye el rol "Tutor"
            }
        }
    });
    if (allRole.length == 0) {
        throw new Error("Roles no encontrados");
    }
    return allRole.map(mapRoleToDto);
}


//Función para validar si existe el usuario y si esta en estado activo

export async function validateActiveUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) throw new UserNotFoundError();

    const userStatus = await user.getUserStatus();
    if (userStatus.userStatusName !== "Activo") {
        // throw Errors.forbiddenAccessError("El usuario no está activo");
        throw new ForbiddenAccessError();
    }

    return user;
}




function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function formatEmail(email: string) {
  return email.toLowerCase();
}
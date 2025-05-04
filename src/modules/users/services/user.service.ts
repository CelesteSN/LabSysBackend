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
import { EmailAlreadyExistsError, RoleNotFoundError, StatusNotFoundError, UserNotFoundError, ForbiddenError } from '../../../errors/customUserErrors';
import { UserFilter } from "../dtos/userFilters.dto";
import { Op, where } from 'sequelize';
import { mapOneUserToDto, OneUserDto } from "../dtos/oneUserResponse.dto";
import { sendEmail } from '../../notifications/services/notification.service';
import {AllRoleDto, mapRoleToDto}  from '../dtos/allRole.dto';




export async function listUsers(userLoguedId: string, filters?: UserFilter): Promise<AllUsersDto[]> {

    //Bloque para validar usuario existente y activo
    const loguedUser = await User.findByPk(userLoguedId);
    if (!loguedUser) {
        throw new UserNotFoundError();
    }

    const userLoguedStatus = await loguedUser.getUserStatus();

    if (!(userLoguedStatus.userStatusName == UserStatusEnum.ACTIVE)) {
        throw new Error("No puede accedr a esta funcionalidad")
    }



    // Construimos condiciones dinámicas
    const whereConditions: any = {};


    const statusRaw = filters?.status?.trim(); // elimina espacios
    const status = statusRaw ?? UserStatusEnum.PENDING; // si no viene, usar "Pendiente"
    const isStatusAll = status.toLowerCase() === UserStatusEnum.ALL.toLowerCase();


    const normalizedRole = filters?.role?.trim();
const isSpecificRole = !!normalizedRole && normalizedRole.toLowerCase() !== 'todos';

    

    if (filters?.search) {
        whereConditions[Op.or] = [
            { userFirstName: { [Op.iLike]: `%${filters.search}%` } },
            { userLastName: { [Op.iLike]: `%${filters.search}%` } }
        ];
    }

    if (filters?.fromDate) {
        whereConditions.createdDate = { ...whereConditions.createdDate, [Op.gte]: filters.fromDate };
    }

    if (filters?.toDate) {
        whereConditions.createdDate = { ...whereConditions.createdDate, [Op.lte]: filters.toDate };
    }

    //Obtengo el rol del usuario logueado para verificar sI  es tutor
    const roleUser = await loguedUser.getRole();
    if (roleUser?.roleName == RoleEnum.TUTOR) {
        //throw new Error('No autorizado para listar usuarios'); // O podés lanzar un ForbiddenError

        const users = await User.findAll({
            where: whereConditions,
            attributes: [
                'userId',
                'userFirstName',
                'userLastName',
                'createdDate'
            ],
            include: [
                {
                  model: UserStatus,
                  attributes: ['userStatusName'],
                  ...(isStatusAll ? {} : { where: { userStatusName: status } })
                },
              
              
                
                    {
                        model: Role,
                        attributes: ['roleName'],
                        ...(isSpecificRole
                          ? { where: { roleName: normalizedRole } }
                          : {} // no aplica filtro → trae todos
                        )
                      }
                      
            ]
        });

        return users.map(mapUserToDto);
    }
    else {
        
        throw new Error("No puede acceder a esta funcionalidad");


    }

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
        userFirstName: firstName,
        userLastName: lastName,
        userDni: dni,
        userEmail: email,
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
    const loguedUser = await User.findByPk(userLoguedId);
    if (!loguedUser) {
        throw new UserNotFoundError();
    }

    const userLoguedStatus = await loguedUser.getUserStatus();

    if (!(userLoguedStatus.userStatusName == UserStatusEnum.ACTIVE)) {
        throw new Error("No puede accedr a esta funcionalidad")
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

export async function addAnswer(userLoguedId: string, userId: string, isAccept: string, comment?: string) {
    //Obtengo el usuario logueado
    const loguedUser = await User.findByPk(userLoguedId);
    if (!loguedUser) {
        throw new UserNotFoundError();
    }

    const userLoguedStatus = await loguedUser.getUserStatus();

    if (!(userLoguedStatus.userStatusName == UserStatusEnum.ACTIVE)) {
        throw new Error("No puede acceder a esta funcionalidad")
    }


    //Obtengo el usuario al que le quiero responder la solicitud de alta
    //const userPending = await User.findByPk(userId)


    const userPending = await User.findByPk(userId,{
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
    if (isAccept == "true") {
        const activeStatus = await UserStatus.findOne({
            where: {
                'userStatusName': UserStatusEnum.ACTIVE
            }
        }

        )
        userPending.setUserStatus(activeStatus?.userStatusId)
        userPending.updatedDate = new Date()
        userPending.save();
        const html = `
            <p>Estimado/a ${userPending.userFirstName},</p>
            <p>Su usuario con permiso ${(await userPendingRole).roleName} ha sido dado de alta satisfactoriamente.</p>
            <p>Para inicar sesión en la paltaforma, ingrese a traves del siguiente botón: Iniciar sesión":</p>
                <p>Muchas gracias.</p>
          `;

        await sendEmail(userPending.userEmail, 'Respuesta de alta de usuario', html);
    }
    else {
        //No lo acepto en la plataforma
        // if (isAccept == "false") {
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
        const html = `
            <p>Estimado/a ${userPending.userFirstName},</p>
            <p>Su usuario con permiso ${(await userPendingRole).roleName} ha sido fue rechazada.</p>
            <p>Motivo de rechazo: ${comment}</p>
                <p>Muchas gracias.</p>
          `;


          await sendEmail(userPending.userEmail, 'Respuesta de alta de usuario', html);
    }

}
//}

export async function modifyUser(id: string, firstName: string, lastName: string, password: string, email: string, roleId: string): Promise<User | null> {

    const user = await User.findByPk(id);
    if (!user) {
        return null; // Usuario no encontrado
    }

    user.userFirstName = firstName;
    user.userLastName = lastName;
    user.userEmail = email;
    user.updatedDate = new Date();
    //user.userPassword = await bcrypt.hash(password, 10); // Hashear la nueva contraseña
    user.userRoleId = roleId; // Asignar el nuevo rol

    await user.save(); // Guardar los cambios en la base de datos

    return user;
}



export async function lowUser(id: string): Promise<void> {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        await user.destroy(); // Eliminar el usuario de la base de datos
    } catch (error) {
        throw new Error("Error al eliminar el usuario");
    }
}


export async function allRoleService(): Promise<AllRoleDto[]>{
    const allRole = await Role.findAll();
    if(allRole.length == 0){
        throw new Error("Roles no encontrados");
    }
    return allRole.map(mapRoleToDto);
}
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.addUser = addUser;
exports.getUser = getUser;
exports.addAnswer = addAnswer;
exports.modifyUser = modifyUser;
exports.lowUser = lowUser;
//import { add } from "winston";
const user_model_1 = require("../models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userStatus_model_1 = require("../models/userStatus.model");
const userStatus_enum_1 = require("../enums/userStatus.enum");
const role_enum_1 = require("../enums/role.enum");
const role_model_1 = require("../models/role.model");
const allUsers_dto_1 = require("../dtos/allUsers.dto");
const customUserErrors_1 = require("../../../errors/customUserErrors");
const sequelize_1 = require("sequelize");
const oneUserResponse_dto_1 = require("../dtos/oneUserResponse.dto");
async function listUsers(userId, filters) {
    //Obtengo el usuario logueado
    const loguedUser = await user_model_1.User.findByPk(userId);
    if (!loguedUser) {
        throw new customUserErrors_1.UserNotFoundError();
    }
    // Construimos condiciones dinámicas
    const whereConditions = {};
    if (filters?.search) {
        whereConditions[sequelize_1.Op.or] = [
            { userFirstName: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
            { userLastName: { [sequelize_1.Op.iLike]: `%${filters.search}%` } }
        ];
    }
    if (filters?.fromDate) {
        whereConditions.createdDate = { ...whereConditions.createdDate, [sequelize_1.Op.gte]: filters.fromDate };
    }
    if (filters?.toDate) {
        whereConditions.createdDate = { ...whereConditions.createdDate, [sequelize_1.Op.lte]: filters.toDate };
    }
    //Obtengo el rol del usuario logueado para verificar que tipo de listado debe visualizar
    const roleUser = await loguedUser.getRole();
    if (roleUser?.roleName == role_enum_1.RoleEnum.ADMIN) {
        //throw new Error('No autorizado para listar usuarios'); // O podés lanzar un ForbiddenError
        const users = await user_model_1.User.findAll({
            where: whereConditions,
            attributes: [
                'userId',
                'userFirstName',
                'userLastName',
                'createdDate'
            ],
            include: [
                {
                    model: userStatus_model_1.UserStatus,
                    attributes: ['userStatusName'],
                    where: {
                        userStatusName: userStatus_enum_1.UserStatusEnum.PENDING
                        // Solo usuarios en estado Pending
                    }
                },
                {
                    model: role_model_1.Role,
                    attributes: ['roleName'],
                    where: {
                        roleName: role_enum_1.RoleEnum.TUTOR
                        // Solo usuarios cuyo rol es Responsable
                    }
                }
            ]
        });
        return users.map(allUsers_dto_1.mapUserToDto);
    }
    else {
        if (roleUser?.roleName == role_enum_1.RoleEnum.TUTOR) {
            const users = await user_model_1.User.findAll({
                where: whereConditions,
                attributes: [
                    'userId',
                    'userFirstName',
                    'userLastName',
                    'createdDate'
                ],
                include: [
                    {
                        model: userStatus_model_1.UserStatus,
                        attributes: ['userStatusName'],
                        where: {
                            userStatusName: userStatus_enum_1.UserStatusEnum.PENDING
                            // Solo usuarios en estado Pending
                        }
                    },
                    {
                        model: role_model_1.Role,
                        attributes: ['roleName'],
                        where: {
                            roleName: role_enum_1.RoleEnum.PASANTE
                            // Solo usuarios cuyo rol es Pasante, agregar Becario
                        }
                    }
                ]
            });
            return users.map(allUsers_dto_1.mapUserToDto);
        }
        throw new customUserErrors_1.ForbiddenError();
    }
}
async function addUser(firstName, lastName, dni, phone_number, password, email, personalFile, roleId) {
    //Valido que el usuario nio exista
    const existingUser = await user_model_1.User.findOne({ where: { "user_email": email } });
    if (existingUser) {
        // throw new Error("El correo electrónico ya está en uso");
        throw new customUserErrors_1.EmailAlreadyExistsError();
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    //busco el estado pendiente
    let status = await userStatus_model_1.UserStatus.findOne({
        where: {
            "user_status_name": userStatus_enum_1.UserStatusEnum.PENDING
        }
    });
    // console.log(status?.userStatusName)
    if (!status) {
        //throw new Error("Estado no encontrado");
        throw new customUserErrors_1.StatusNotFoundError();
    }
    //Valido que el rol ingresadoeste en la DB
    let role = await role_model_1.Role.findByPk(roleId);
    if (!role) {
        throw new Error("Rol no encontrado");
    }
    //creo el usuario
    const newUser = await user_model_1.User.build();
    //newUser.userId = randomUUID(),
    newUser.userFirstName = firstName,
        newUser.userLastName = lastName,
        newUser.userDni = dni,
        newUser.userPhoneNumber = phone_number,
        newUser.userEmail = email,
        newUser.userPassword = hashedPassword,
        newUser.userPersonalFile = personalFile,
        newUser.createdDate = new Date(),
        newUser.updatedDate = new Date(),
        newUser.userStatusId = status.userStatusId;
    newUser.userRoleId = role.roleId;
    //await newUser.setUserStatus(status, {save: false}),
    //await newUser.setUserRole(role, {save: false}); 
    await newUser.save();
    return newUser;
}
async function getUser(id) {
    const user = await user_model_1.User.findByPk(id, {
        include: [
            {
                model: role_model_1.Role,
                attributes: ['roleName']
            },
            {
                model: userStatus_model_1.UserStatus,
                attributes: ['userStatusName']
            }
        ]
    });
    if (!user) {
        throw new customUserErrors_1.UserNotFoundError();
    }
    return (0, oneUserResponse_dto_1.mapOneUserToDto)(user);
}
async function addAnswer(userLoguedId, userId, isAccept, comment) {
    //Obtengo el usuario logueado
    const loguedUser = await user_model_1.User.findByPk(userLoguedId);
    if (!loguedUser) {
        throw new customUserErrors_1.UserNotFoundError();
    }
    //Obtengo el usuario al que le quiero responder la solicitud de alta
    const userPending = await user_model_1.User.findByPk(userId);
    if (!userPending) {
        throw new customUserErrors_1.UserNotFoundError();
    }
    //Lo acepto en la plataforma
    if (isAccept == "true") {
        const activeStatus = await userStatus_model_1.UserStatus.findOne({
            where: {
                'userStatusName': userStatus_enum_1.UserStatusEnum.ACTIVE
            }
        });
        userPending.setUserStatus(activeStatus?.userStatusId);
        userPending.updatedDate = new Date();
        userPending.save();
    }
    else {
        //No lo acepto en la plataforma
        // if (isAccept == "false") {
        const rejectedStatus = await userStatus_model_1.UserStatus.findOne({
            where: {
                'userStatusName': userStatus_enum_1.UserStatusEnum.REJECTED
            }
        });
        userPending.setUserStatus(rejectedStatus?.userStatusId);
        userPending.updatedDate = new Date();
        userPending.userDisabledReason = comment;
        userPending.save();
    }
}
//}
async function modifyUser(id, firstName, lastName, password, email, roleId) {
    const user = await user_model_1.User.findByPk(id);
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
async function lowUser(id) {
    try {
        const user = await user_model_1.User.findByPk(id);
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        await user.destroy(); // Eliminar el usuario de la base de datos
    }
    catch (error) {
        throw new Error("Error al eliminar el usuario");
    }
}

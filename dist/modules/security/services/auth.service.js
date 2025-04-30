"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
exports.recoveryPassword = recoveryPassword;
const user_model_1 = require("../models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../../../config/app");
const userStatus_enum_1 = require("../enums/userStatus.enum");
//import { sendTemplatedEmail } from '../../notifications/services/notification.service';
// src/modules/security/services/auth.service.ts
const notification_service_1 = require("../../notifications/services/notification.service");
// import { generateRecoveryToken } from './auth.utils'; // si usás JWT
const loginUser = async (loginData) => {
    const { email, password } = loginData;
    const user = await user_model_1.User.findOne({ where: { userEmail: email } });
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const userStatus = await user.getUserStatus();
    if (userStatus.userStatusName == userStatus_enum_1.UserStatusEnum.PENDING) {
        throw new Error('La cuenta no ha sido confirmada. Por favor, revise su correo electrónico para confirmar su cuenta');
    }
    if (userStatus.userStatusName == userStatus_enum_1.UserStatusEnum.ACTIVE) {
        const userRole = await user.getRole();
        const isPasswordValid = await bcrypt_1.default.compare(password, user.userPassword);
        if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.userId,
            email: user.userEmail,
            role: user.userRoleId
        }, app_1.appConfig.JWT_SECRET, { expiresIn: '2h' });
        return {
            token,
            user: {
                id: user.userId,
                name: `${user.userFirstName} ${user.userLastName}`,
                email: user.userEmail,
                role: userRole.roleName
            }
        };
    }
    else {
        throw new Error("El usuario no es válido");
    }
    ;
};
exports.loginUser = loginUser;
async function recoveryPassword(email) {
    const user = await user_model_1.User.findOne({ where: { userEmail: email } });
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    // 🔐 Token para recuperar contraseña (ejemplo)
    const token = `abc123token`; // reemplazá esto con un JWT firmado o uuid
    const recoveryLink = `https://tu-app.com/reset-password/${token}`;
    const html = `
    <p>Estimado/a ${user.userFirstName},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p>Debe ingresar al siguiente enlace para continuar:</p>
    <p><a href="${recoveryLink}">${recoveryLink}</a></p>
    <p>Si no fue usted, ignore este mensaje.</p>
        <p>Muchas gracias.</p>
  `;
    await (0, notification_service_1.sendEmail)(email, 'Recuperación de contraseña', html);
}

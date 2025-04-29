import { User } from "../models/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginDto } from '../dtos/auth.dto';
import { appConfig } from '../../../config/app';
import {UserStatusEnum} from '../enums/userStatus.enum';
//import { sendTemplatedEmail } from '../../notifications/services/notification.service';
// src/modules/security/services/auth.service.ts
import { sendEmail } from '../../notifications/services/notification.service';

// import { generateRecoveryToken } from './auth.utils'; // si usás JWT


export const loginUser = async (loginData: LoginDto) => {
  const { email, password } = loginData;

  const user = await User.findOne({ where: { userEmail: email } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  const userStatus = await user.getUserStatus()
  if(userStatus.userStatusName == UserStatusEnum.PENDING){
    throw new Error('La cuenta no ha sido confirmada. Por favor, revise su correo electrónico para confirmar su cuenta')
  }


  if(userStatus.userStatusName == UserStatusEnum.ACTIVE){

  const userRole = await user.getRole();


  const isPasswordValid = await bcrypt.compare(password, user.userPassword);
  if (!isPasswordValid) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    {
      userId: user.userId,
      email: user.userEmail,
      role: user.userRoleId
    },
    appConfig.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user.userId,
      name: `${user.userFirstName} ${user.userLastName}`,
      email: user.userEmail,
      role: userRole.roleName
    }
  }
  }else{
    throw new Error("El usuario no es válido")
  };
};




export async function recoveryPassword(email: string): Promise<void> {
  const user = await User.findOne({ where: { userEmail: email } });

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

  await sendEmail(email, 'Recuperación de contraseña', html);
}



import { User } from "../models/user.model";
import bcrypt, { hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginDto } from '../dtos/auth.dto';
import { appConfig } from '../../../config/app';
import {UserStatusEnum} from '../enums/userStatus.enum';
//import { sendTemplatedEmail } from '../../notifications/services/notification.service';
// src/modules/security/services/auth.service.ts
import { sendEmail } from '../../notifications/services/notification.service';

// import { generateRecoveryToken } from './auth.utils'; // si usás JWT
// src/modules/security/services/auth.service.ts
import { BlackListToken } from '../models/blackListToken.model';


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
    throw new Error("No podés iniciar sesión por el momento")
  };
};



//solicitud para recuperar la contraseña
export async function recoveryPassword(email: string): Promise<void> {
  const user = await User.findOne({ where: { userEmail: email } });

  if (!user) {
  // throw new Error('Usuario no encontrado');
    const error = new Error("No se encontró el usuario");
  error.name = "NotFoundError"; // para diferenciarlo en el handler
  throw error;
  }

  // 🔐 Token para recuperar contraseña (ejemplo)
  //const token = `abc123token`; // reemplazá esto con un JWT firmado o uuid


  const token = jwt.sign(
    { userId: user.userId },               // payload
    process.env.JWT_SECRET!,              // clave secreta desde .env
    { expiresIn: '24h' }                   // duración del token
  );

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





//validación del token en el link
export async function verifyRecoveryTokenService(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return { success: false, status: 404, message: 'Usuario no encontrado' };
    }

    return { success: true, status: 200, message: 'Token válido', userId: user.userId };
  } catch (error) {
    return { success: false, status: 400, message: 'Token inválido o expirado' };
  }
}


//Cambio de contraeña
export async function recoveryPasswordSaveService(userId: string, password: string){
const userNewPassword = await User.findByPk(userId);
if(!userNewPassword){
  return { success: false, status: 404, message: 'Usuario no encontrado' };
}

userNewPassword.userPassword = await bcrypt.hash(password, 10);
userNewPassword.updatedDate = new Date(),
await userNewPassword.save()

return {
  success: true,
  status: 200,
  message: 'Se cambió la contraseña exitosamente'
};

}

//logout
export async function logoutService(token: string): Promise<void> {
  const decoded: any = jwt.decode(token);

  if (!decoded?.exp) {
    throw new Error('Token inválido');
  }

  await BlackListToken.create({
    token,
    expires_at: new Date(decoded.exp * 1000)
  });
}

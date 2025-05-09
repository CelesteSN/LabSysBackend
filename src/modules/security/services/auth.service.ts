import { User } from "../models/user.model";
import bcrypt, { hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginDto } from '../dtos/auth.dto';
import { appConfig } from '../../../config/app';
import { UserStatusEnum } from '../enums/userStatus.enum';
//import { sendTemplatedEmail } from '../../notifications/services/notification.service';
// src/modules/security/services/auth.service.ts
import { sendEmail } from '../../notifications/services/notification.service';

// import { generateRecoveryToken } from './auth.utils'; // si usás JWT
// src/modules/security/services/auth.service.ts
import { BlackListToken } from '../models/blackListToken.model';
import { Role } from '../models/role.model';
import { Functionality } from '../models/functionality.model';
import { Op, where } from "sequelize";
import RoleFunctionality from "../models/roleFunctionality.model";
import { RoleFunctionalityDto } from "../dtos/roleFunctionality.dto";
import FunctionalityDto from "../dtos/functionality.dto";
import { UserStatus } from "../models/userStatus.model";
import {PasswordRecovery }from "../models/passwordRecovery.model";
import { randomUUID } from "crypto";
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
//const PASSWORD_TOKEN_TTL: process.env.PASSWORD_TOKEN_TTL;
import { EmailAlreadyExistsError, RoleNotFoundError, StatusNotFoundError, UserNotFoundError, ForbiddenError, ForbiddenAccessError, UserAlreadyDeletedError } from '../../../errors/customUserErrors';




export const loginUser = async (loginData: LoginDto) => {
  const { email, password } = loginData;

  const user = await User.findOne({ where: { userEmail: email } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const userStatus = await user.getUserStatus()
  if (userStatus.userStatusName == UserStatusEnum.PENDING) {
    throw new Error('La cuenta no ha sido confirmada. Por favor, revise su correo electrónico para confirmar su cuenta')
  }


  if (userStatus.userStatusName == UserStatusEnum.ACTIVE) {

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
  } else {
    throw new Error("Usuario no encontrado.")
  };
};



//solicitud para recuperar la contraseña
export async function recoveryPassword(email: string): Promise<void> {
  const user = await User.findOne({ where: { userEmail: email } });

  if (!user) {
    // throw new Error('Usuario no encontrado');
    const error = new Error("Usuario no encontrado");
    error.name = "NotFoundError"; // para diferenciarlo en el handler
    throw error;
  }
const userStatus = await user.getUserStatus();
if(!(userStatus.userStatusName == UserStatusEnum.ACTIVE)){throw new Error("Usuario no válido")};
  // 🔐 Token para recuperar contraseña (ejemplo)
  //const token = `abc123token`; // reemplazá esto con un JWT firmado o uuid

  // const token = jwt.sign(
  //   { userId: user.userId },               // payload
  //   process.env.JWT_SECRET!,              // clave secreta desde .env
  //   { expiresIn: '24h' }                   // duración del token
  // );
  


  //Creamos el nuevo token
  let newPasswordToken = PasswordRecovery.build();
  newPasswordToken.passwordRecoveryUserId = user.userId;

  //Calculamos el tiempo de expiración como 1 días por defecto(24 hs)
  let expDate: Date = new Date()
  expDate.setDate(expDate.getDate() + parseInt('1'));
  newPasswordToken.expirationDate = expDate;
  const token = randomUUID();
  newPasswordToken.passwordRecoveryToken = token;
  //newPasswordToken.passwordRecoveryToken = token;
  newPasswordToken.createdDate= new Date;


  //logger.debug("Se guarda el nuevo token generado");
  await newPasswordToken.save();
  

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
    const tokenSaved = await PasswordRecovery.findOne({
      where:{
        "passwordRecoveryToken" : token,
        "readDate" : null
      },
      include: [{ model: User, as: "passwordUser" }] // importante: traé el usuario asociado
    });

    if(!tokenSaved)
      {return { success: false, message: "Token no encontrado o ya fue utilizado", status: 404 };}
    if(tokenSaved.expirationDate < new Date())
      return { success: false, message: "El enlace al que está intentando acceder ha expirado. Por favor, solicite un nuevo enlace sirequiere modificar su contraseña/desbloquear su usuario.", status: 410 }; // 410 Gone


    const userValid = await tokenSaved.getPasswordUser();
    tokenSaved.readDate = new Date();
    
    return { success: true, message: "Token válido", user: userValid.userId };
   
}


//Cambio de contraeña
export async function recoveryPasswordSaveService(userId: string, password: string, repeatPass: string) {
  const userNewPassword = await User.findByPk(userId);
  if (!userNewPassword) {
    return { success: false, status: 404, message: 'Usuario no encontrado' };
  }
  if(password != repeatPass){
    return { success: false, status: 404, message: 'Las contraseñas ingresadas no coinciden' };
  };
  userNewPassword.userPassword = await bcrypt.hash(password, 10);
  userNewPassword.updatedDate = new Date(),
    await userNewPassword.save()

  return {
    success: true,
    status: 200,
    message: 'Su contraseña ha sido actualizada.'
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





// export const getFunctionalitiesByRoleId = async (roleId: string) => {


//   return await RoleFunctionality.findAll({
//     where:{
//       "role_id": roleId
//     },
//     include: Functionality
//   }).then((functionalities) => {
//     if (!functionalities) return []
//     return functionalities.map((functionality) => {
//         return functionality.Functionality.functionalityName
//     })
// })
// }




export const getFunctionalitiesByRoleId = async (userLoguedId: string): Promise<RoleFunctionalityDto[]> => {

const userValid = await User.findOne({
  where:{
    userId : userLoguedId
  },
  include:[{model: UserStatus, where:{userStatusName : UserStatusEnum.ACTIVE}}]
});
    
if(!userValid){throw new UserNotFoundError()};
  const roles = await Role.findAll({ attributes: ['roleId', 'roleName'] });

  if (!roles.length) throw new Error('No se encontraron roles');

  const result: RoleFunctionalityDto[] = [];

  for (const role of roles) {
    const roleFunctionalities = await RoleFunctionality.findAll({
      where: { roleFunctionalityRoleId: role.roleId },
      include: [
        {
          model: Functionality,
          attributes: ['functionalityName']
        }
      ]
    });

    const functionalityNames = roleFunctionalities.map(rf => rf.Functionality?.functionalityName).filter(Boolean);

    result.push({
      nameRole: role.roleName,
      functionality: functionalityNames
    });
  }

  return result;
};



export const verifyTokenService = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: ['userId', 'userFirstName', 'userLastName'],
      include: [{ association: 'UserStatus' }]
    });

    if (!user || user.UserStatus?.userStatusName !== UserStatusEnum.ACTIVE) {
      throw new Error('Usuario inactivo o no encontrado');
    }

    return {
      userId: user.userId,
      name: `${user.userFirstName} ${user.userLastName}`
    };

  } catch (error: any) {
    throw new Error('Token inválido o expirado');
  }
};



// userExistsAndIsActive = async (username: string): Promise<boolean> => {
//   let result = await User.findOne({
//       where: {
//           userEmail: username
//       },
//       include: [{
//           model: UserStatus,
//           where: {
//               "userStatusName": { [Op.eq]: UserStatusEnum.ACTIVE }
//           }
//       }]
//   }).then((user) => {
//       if (!user) throw new Error(`El usuario ${username} está bloqueado o no existe`);
//       return true;

//   }).catch((err: any) => {
//       //logger.debug(err.message);
//       return false;
//   });

//   return result;
// }
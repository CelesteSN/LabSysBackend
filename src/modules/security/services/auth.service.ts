import { User } from "../models/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginDto } from '../dtos/auth.dto';
import { appConfig } from '../../../config/app';

export const loginUser = async (loginData: LoginDto) => {
  const { email, password } = loginData;

  const user = await User.findOne({ where: { userEmail: email } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

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
      email: user.userEmail
    }
  };
};

import { Request, Response } from 'express';
import {
  loginUser,
  recoveryPassword,
  verifyRecoveryTokenService,
  recoveryPasswordSaveService,
  logoutService,
  getFunctionalitiesByRoleId,
  verifyTokenService
} from '../services/auth.service';
import { catchAsync } from '../../../utils/catchAsync';




export const loginController = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};

export const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await recoveryPassword(email);

  res.status(200).json({
    success: true,
    message: 'Se le ha enviado un correo electrónico con las instrucciones para continuar el proceso de desbloqueo o cambio de contraseña. Recuerde que tiene una vigencia de 24 horas. Por favor, valide que el correo no se encuentre en la bandeja de spam.'
  });
});



export const verifyRecoveryToken = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await verifyRecoveryTokenService(token);

  if (!result.success) {
    return res.status(result.status || 400).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
    userId: result.user
  });
});



export const saveNewPassword= catchAsync(async(req: Request, res: Response) =>{
  const { password, userId, repeatPass } = req.body;

  const result = await recoveryPasswordSaveService(userId, password, repeatPass);

  if (!result.success) {
    return res.status(result.status || 400).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});


export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(400).json({ mensaje: 'Token faltante' });

  try {
    await logoutService(token);
    res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
};





export const getRoleFunctionalitiesController = async (req: Request, res: Response) => {
  try {
    const data = await getFunctionalitiesByRoleId();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error al obtener roles y funcionalidades:', error.message);
    res.status(500).json({ message: 'Error al obtener los datos' });
  }
}




export const verifyToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const userInfo = await verifyTokenService(token);
    return res.status(200).json(userInfo);
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};
import { Request, Response } from 'express';
import { loginUser, recoveryPassword } from '../services/auth.service';
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
    message: 'Se le ha enviado un correo electrónico con las instrucciones para continuar el proceso de desbloqueo o cambio de contraseña. Recuerde que tiene una vigencia de 24 horas. Por favor, valide que el correo no se encuentre en la bandeja de spam.'});
});
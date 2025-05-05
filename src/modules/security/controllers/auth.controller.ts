import { Request, Response } from 'express';
import { loginUser, recoveryPassword, verifyRecoveryTokenService, recoveryPasswordSaveService, logoutService, getFunctionalitiesByRoleId} from '../services/auth.service';
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







export async function verifyRecoveryToken(req: Request, res: Response) {
  const { token } = req.params;

  const result = await verifyRecoveryTokenService(token);
  return res.status(result.status).json(result.success ? { message: result.message, userId: result.userId } : { message: result.message });
};


export async function saveNewPassword(req: Request, res: Response){
  const { password, userId } = req.body;

  const result = await recoveryPasswordSaveService(userId, password);

  return res.status(result.status).json({ message: result.message });
};

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



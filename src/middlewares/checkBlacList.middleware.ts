import { Request, Response, NextFunction } from 'express';
import { BlackListToken } from '../modules/security/models/blackListToken.model';

export const checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  const exists = await BlackListToken.findOne({ where: { token } });
  if (exists) {
    return res.status(401).json({ mensaje: 'Token inválido. Cerrá sesión e iniciá de nuevo.' });
  }

  next();
};

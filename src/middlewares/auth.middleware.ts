import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No cuenta con los permisos necesarios para acceder a este recurso' });
    //return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    
    const decoded = jwt.verify(token, appConfig.JWT_SECRET) as { userId: string };

req.user = {
  userLoguedId: decoded.userId
};

    next();
  } catch (err) {
    //return res.status(403).json({ message: 'Token inválido' });
    return res.status(403).json({ message: 'No cuenta con los permisos necesarios para acceder a este recurso' });
  }
};

import { Request, Response } from 'express';
import { loginUser } from '../services/auth.service';

export const loginController = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};

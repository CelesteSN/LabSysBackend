// src/modules/notification/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync';
import { sendEmail } from '../services/notification.service';

export const notify = catchAsync(async (req: Request, res: Response) => {
  const { to, subject, message } = req.body;

  const html = `<p>${message}</p>`;

  await sendEmail(to, subject, html);

  res.status(200).json({ success: true, message: 'Email enviado correctamente' });
});



// src/modules/notification/services/notification.service.ts
import nodemailer from 'nodemailer';
import { mailConfig } from '../../../config/mailerConfig';


//console.log('Mail config:', mailConfig.auth); // <-- ACÁ lo ponés
const transporter = nodemailer.createTransport(mailConfig);

export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const mailOptions = {
    from: `"Celeste UTN" <${mailConfig.auth.user}>`,
    to,
    subject,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
}

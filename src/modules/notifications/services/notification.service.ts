

// src/modules/notification/services/notification.service.ts
import nodemailer from 'nodemailer';
import { mailConfig } from '../../../config/mailerConfig';


//console.log('Mail config:', mailConfig.auth); // <-- ACÁ lo ponés
const transporter = nodemailer.createTransport(mailConfig);

export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const mailOptions = {
    from: `"LabSys" <${mailConfig.auth.user}>`,
    to,
    subject,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
}





export async function renderTemplate(template: string, params: Record<string, any>): Promise<string> {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = key.trim().split('.').reduce((acc: any, part: any) => acc?.[part], params);
    return value ?? '';
  });
}


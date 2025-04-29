

import dotenv from 'dotenv';
dotenv.config(); // ← esto es lo que carga .env
export const mailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para puerto 465
    auth: {
      user: process.env.MAIL_USER, // tu correo
      pass: process.env.MAIL_PASS  // tu app password o clave real
    }
  };
  
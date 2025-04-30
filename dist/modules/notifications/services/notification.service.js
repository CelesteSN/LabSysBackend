"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
// src/modules/notification/services/notification.service.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailerConfig_1 = require("../../../config/mailerConfig");
console.log('Mail config:', mailerConfig_1.mailConfig.auth); // <-- ACÁ lo ponés
const transporter = nodemailer_1.default.createTransport(mailerConfig_1.mailConfig);
async function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: `"Celeste UTN" <${mailerConfig_1.mailConfig.auth.user}>`,
        to,
        subject,
        html: htmlContent
    };
    await transporter.sendMail(mailOptions);
}

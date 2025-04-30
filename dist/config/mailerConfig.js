"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // ← esto es lo que carga .env
exports.mailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para puerto 465
    auth: {
        user: process.env.MAIL_USER, // tu correo
        pass: process.env.MAIL_PASS // tu app password o clave real
    }
};

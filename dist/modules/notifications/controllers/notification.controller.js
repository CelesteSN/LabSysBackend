"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const notification_service_1 = require("../services/notification.service");
exports.notify = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { to, subject, message } = req.body;
    const html = `<p>${message}</p>`;
    await (0, notification_service_1.sendEmail)(to, subject, html);
    res.status(200).json({ success: true, message: 'Email enviado correctamente' });
});

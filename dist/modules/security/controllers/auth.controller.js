"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordReset = exports.loginController = void 0;
const auth_service_1 = require("../services/auth.service");
const catchAsync_1 = require("../../../utils/catchAsync");
const loginController = async (req, res) => {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(401).json({ message: error.message });
    }
};
exports.loginController = loginController;
exports.requestPasswordReset = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email } = req.body;
    await (0, auth_service_1.recoveryPassword)(email);
    res.status(200).json({
        success: true,
        message: 'Se le ha enviado un correo electrónico con las instrucciones para continuar el proceso de desbloqueo o cambio de contraseña. Recuerde que tiene una vigencia de 24 horas. Por favor, valide que el correo no se encuentre en la bandeja de spam.'
    });
});

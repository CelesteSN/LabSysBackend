"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerUser = exports.getUserById = exports.createUser = exports.getAllUsers = void 0;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const user_service_1 = require("../services/user.service");
const catchAsync_1 = require("../../../utils/catchAsync");
const joi_1 = require("joi");
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { userLoguedId } = req.user;
    const filters = {
        search: req.query.search,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate) : undefined
    };
    const users = await (0, user_service_1.listUsers)(userLoguedId, filters);
    res.status(200).json({
        success: true,
        data: users
    });
});
exports.createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { firstName, lastName, dni, phone_number, password, email, personalFile, roleId } = req.body;
    const newUser = await (0, user_service_1.addUser)(firstName, lastName, dni, phone_number, password, email, personalFile, roleId);
    // res.status(201).json(newUser);
    res.status(201).json({
        success: true,
        messaje: "El usuario ha sido creado exitosamente. Recuerde que para acceder a la plataforma, su solicitud deberá ser aprobada. Se le notificará por correo electrónico cuando su solicitud sea aprobada o rechazada."
    });
});
exports.getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id; // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
    const user = await (0, user_service_1.getUser)(userId);
    res.status(200).json({
        success: true,
        data: user
    });
});
exports.answerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { userLoguedId } = req.user;
    const userId = req.params.id;
    const isAccept = String(req.query.isAccept);
    const comment = req.body;
    await (0, user_service_1.addAnswer)(userLoguedId, userId, isAccept, comment);
    res.status(201).json({
        success: true,
        messaje: "Solicitud respondida exitosamente"
    });
});
async function updateUser(req, res) {
    const { token } = req.user;
    const userId = req.params.id;
    const isAccept = joi_1.boolean; // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    const email = req.body.email;
    const roleId = req.body.roleId;
    try {
        const user = await (0, user_service_1.modifyUser)(userId, firstName, lastName, password, email, roleId);
        if (user !== null) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario" });
    }
}
async function deleteUser(req, res) {
    const userId = req.params.id; // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
    try {
        await (0, user_service_1.lowUser)(userId);
        res.status(200).json({ message: "Usuario eliminado" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario" });
    }
}

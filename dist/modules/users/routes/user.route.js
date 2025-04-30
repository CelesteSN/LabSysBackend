"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const validateRequest_1 = require("../../../middlewares/validateRequest");
const createUserValidation_1 = require("../validations/createUserValidation");
exports.userRouter = (0, express_1.Router)();
// userRouter.get("/", authenticateToken, getAllUsers);
// userRouter.post("/", createUser);
// userRouter.get("/:id", authenticateToken, getUserById); // Cambia esto para obtener un usuario específico por ID
// userRouter.put("/:id", authenticateToken, updateUser); // Cambia esto para actualizar un usuario específico por ID
// userRouter.delete("/:id", authenticateToken, deleteUser); // Cambia esto para eliminar un usuario específico por ID
exports.userRouter.get("/", auth_middleware_1.authenticateToken, user_controller_1.getAllUsers);
exports.userRouter.post("/", (0, validateRequest_1.validateRequest)({ body: createUserValidation_1.createUserValidation }), user_controller_1.createUser);
exports.userRouter.get("/:id", auth_middleware_1.authenticateToken, user_controller_1.getUserById); // Cambia esto para obtener un usuario específico por ID
exports.userRouter.put("/:id", auth_middleware_1.authenticateToken, user_controller_1.answerUser);
exports.userRouter.put("/:id", auth_middleware_1.authenticateToken, user_controller_1.updateUser); // Cambia esto para actualizar un usuario específico por ID
exports.userRouter.delete("/:id", auth_middleware_1.authenticateToken, user_controller_1.deleteUser); // Cambia esto para eliminar un usuario específico por ID

import { Router } from "express";
import { getAllUsers, createUser, getUserById, answerUser, updateUser, deleteUser} from "../controllers/user.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createUserValidation } from '../validations/createUserValidation';


export const userRouter = Router();

// userRouter.get("/", authenticateToken, getAllUsers);
// userRouter.post("/", createUser);
// userRouter.get("/:id", authenticateToken, getUserById); // Cambia esto para obtener un usuario específico por ID
// userRouter.put("/:id", authenticateToken, updateUser); // Cambia esto para actualizar un usuario específico por ID
// userRouter.delete("/:id", authenticateToken, deleteUser); // Cambia esto para eliminar un usuario específico por ID

userRouter.get("/", authenticateToken, getAllUsers);
userRouter.post("/", validateRequest({body: createUserValidation}), createUser);
userRouter.get("/:id", authenticateToken,  getUserById); // Cambia esto para obtener un usuario específico por ID
userRouter.put("/:id", authenticateToken, answerUser)
userRouter.put("/:id", authenticateToken,  updateUser); // Cambia esto para actualizar un usuario específico por ID
userRouter.delete("/:id", authenticateToken,  deleteUser); // Cambia esto para eliminar un usuario específico por ID
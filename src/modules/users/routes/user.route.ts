import { Router } from "express";
import { getAllUsers, createUser, getUserById, answerUser, updateUser, deleteUser, showAllRole} from "../controllers/user.controller";
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createUserValidation } from '../validations/createUserValidation';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import { searchValidation } from '../validations/getAllUsersQueryParam.validation';




export const userRouter = Router();

userRouter.get('/roles', showAllRole);
userRouter.get("/", authenticateToken, checkBlacklist, validateRequest({ query: searchValidation }), getAllUsers);
userRouter.post("/", validateRequest({body: createUserValidation}), createUser);
userRouter.get("/:id", authenticateToken, checkBlacklist,  getUserById); // Cambia esto para obtener un usuario específico por ID
userRouter.put("/:id/answer", authenticateToken,  checkBlacklist, answerUser)
userRouter.put("/:id", authenticateToken, checkBlacklist,  updateUser); // Cambia esto para actualizar un usuario específico por ID
userRouter.delete("/:id", authenticateToken, checkBlacklist,  deleteUser); // Cambia esto para eliminar un usuario específico por ID
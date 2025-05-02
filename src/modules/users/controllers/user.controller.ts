import { listUsers, addUser, getUser, modifyUser, lowUser, addAnswer } from "../services/user.service";
import { Request, Response } from "express";
import { AllUsersDto } from "../dtos/allUsers.dto"
import { catchAsync } from '../../../utils/catchAsync';
import { UserFilter } from "../dtos/userFilters.dto";
import { boolean } from "joi";



export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const filters: UserFilter = {
    search: req.query.search as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined
  };

  const users: AllUsersDto[] = await listUsers(userLoguedId, filters);
  if (users.length === 0) {
    return res.status(200).json({
      success: true,
      mensaje: 'No se encontraron resultados',
    });
  }

  return res.status(200).json({
    success: true,
    data: users
  });
})



export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, dni, phone_number, password, email, personalFile, roleId } = req.body;

  const newUser = await addUser(firstName, lastName, dni, password, email, personalFile, roleId, phone_number);
  // res.status(201).json(newUser);
  res.status(201).json({
    success: true,
    messaje: "El usuario ha sido creado exitosamente. Recuerde que para acceder a la plataforma, su solicitud deberá ser aprobada. Se le notificará por correo electrónico cuando su solicitud sea aprobada o rechazada."
  });
})


export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;
  const userId = req.params.id; // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
  const user = await getUser(userLoguedId, userId);
  res.status(200).json({
    success: true,
    data: user
  });
})

export const answerUser = catchAsync(async (req: Request, res: Response) => {

  const { userLoguedId } = (req as any).user;

  const userId = req.params.id;
  const isAccept = String(req.query.isAccept);
  const comment = req.body.comment;
  await addAnswer(userLoguedId, userId, isAccept, comment);
  res.status(201).json({
    success: true,
    messaje: "Solicitud respondida exitosamente"
  })
})


export async function updateUser(req: Request, res: Response): Promise<void> {
  const { token } = (req as any).user;
  const userId = req.params.id;
  const isAccept = boolean // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;
  const email = req.body.email;
  const roleId = req.body.roleId;
  try {
    const user = await modifyUser(userId, firstName, lastName, password, email, roleId);
    if (user !== null) {
      res.status(200).json(user);
    }
    else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
}


export async function deleteUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.id; // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
  try {
    await lowUser(userId);
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
}
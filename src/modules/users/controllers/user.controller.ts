import { listUsers, addUser, getUser, modifyUser, lowUser, addAnswer, allRoleService } from "../services/user.service";
import { Request, Response } from "express";
import { AllUsersDto } from "../dtos/allUsers.dto"
import { catchAsync } from '../../../utils/catchAsync';
import { UserFilter } from "../dtos/userFilters.dto";
import { boolean } from "joi";
import { UserStatusEnum } from "../enums/userStatus.enum";
import { RoleEnum } from "../enums/role.enum";
import { ResponseUserEnum } from "../enums/responseUser.enum";
import { ModifyUserInputDTO } from "../dtos/updatedUser.dto";



export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { userLoguedId } = (req as any).user;

  const pageNumber = parseInt(req.query.pageNumber as string) || 0;

  const filters: UserFilter = {
    pageNumber,
    search: req.query.search as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
    status: req.query.status as UserStatusEnum || undefined,
    role: req.query.role as RoleEnum || undefined,
  };

  const users: AllUsersDto[] = await listUsers(userLoguedId, filters);

  if (users.length === 0) {
    return res.status(200).json({
      success: true,
      pageNumber,
      mensaje: 'No se encontraron resultados',
    });
  }

  return res.status(200).json({
    success: true,
    pageNumber,
    data: users,
  });
});




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
  const response = req.body.response as ResponseUserEnum;
  const comment = req.body.comment;
  await addAnswer(userLoguedId, userId, response, comment);
  res.status(200).json({
    success: true,
    messaje: "Solicitud respondida exitosamente, se envió un email notificando al usuario"
  })
})


export const updateUser = catchAsync(async(req: Request, res: Response)=> {
  const { userLoguedId } = (req as any).user;
  const userId = req.params.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email  = req.body.email;
  const  personalFile = req.body.personalFile;
  const dni = req.body.dni;
  const phoneNumber= req.body.phoneNumber;
  
    const user = await modifyUser(userLoguedId, userId, firstName, lastName, email, personalFile, dni, phoneNumber);
    res.status(200).json({
      success: true,
      messaje: "Los datos se actualizaron exitosamente"
    })

  });

export const deleteUser = catchAsync(async(req: Request, res: Response)=> {
  const userId = req.params.id; // Asegúrate de que el ID del usuario se pase como un parámetro en la URL
  const { userLoguedId } = (req as any).user;
  await lowUser(userLoguedId, userId);
  res.status(200).json({
    success: true,
    messaje: "La cuenta fue dada de baja exitosamente"
  })
})

export const showAllRole = catchAsync(async(req: Request, res: Response)=>{
  const roles = await allRoleService();

  if (roles.length === 0) {
    return res.status(200).json({
      success: true,
      mensaje: 'No se encontraron resultados',
    });
  }

  return res.status(200).json({
    success: true,
    data: roles
  });
})

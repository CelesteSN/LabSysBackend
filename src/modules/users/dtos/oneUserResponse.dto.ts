import { User } from "../models/user.model";


export type OneUserDto = {
    id: string;
    firstName: string;
    lastName: string;
    dni: string
    email: string;
    phoneNumber?: string;
    personalFile: string;
    status: string;
    role: string;
    comment?: string
    createdDate: string
};

export function mapOneUserToDto(user: User): OneUserDto {
    return {
        id: user.userId,
        //name: `${user.userFirstName} ${user.userLastName}`,
        firstName: user.userFirstName,
        lastName: user.userLastName,
        dni: user.userDni,
        email: user.userEmail,
        personalFile: user.userPersonalFile,
        phoneNumber: user.userPhoneNumber,
        status: user.UserStatus?.userStatusName || '',
        role: user.Role?.roleName || '',
        comment: user.userDisabledReason || '',

          createdDate: user.createdDate.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    };
}

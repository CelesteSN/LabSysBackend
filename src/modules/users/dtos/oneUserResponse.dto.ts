import { User } from "../models/user.model";


export type OneUserDto = {
    id: string;
    name: string;
    dni: string
    email: string;
    phoneNumber?: string;
    personalFile: string;
    status: string;
    role: string;
    //createdDate: string
};

export function mapOneUserToDto(user: User): OneUserDto {
    return {
        id: user.userId,
        name: `${user.userFirstName} ${user.userLastName}`,
        dni: user.userDni,
        email: user.userEmail,
        personalFile: user.userPersonalFile,
        phoneNumber: user.userPhoneNumber,
        status: user.UserStatus?.userStatusName || '',
        role: user.Role?.roleName || '',

        //   createdDate: user.createdDate.toLocaleDateString('es-AR', {
        //     day: '2-digit',
        //     month: '2-digit',
        //     year: 'numeric',
        // })
    };
}

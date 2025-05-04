import {User} from "../models/user.model";


export type AllUsersDto = {
    id: string;
    name: string;
    //email: string;
    status: string;
    role: string;
    createdDate: string
  };
  
  export function mapUserToDto(user: User): AllUsersDto {
    return {
      id: user.userId,
      name: `${user.userFirstName} ${user.userLastName}`,
      //email: user.userEmail,
      status: user.UserStatus.userStatusName,
      role: user.Role.roleName,
      createdDate: user.createdDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
    };
  }
  

 // const formattedDate = date.toISOString().split('T')[0];
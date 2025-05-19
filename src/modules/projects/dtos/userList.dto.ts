import { User } from "../models/user.model";


export type AllUsersDto = {
    id: string;
    name: string;

};

export function mapUserToDto(user: User): AllUsersDto {
    return {
        id: user.userId,
        name: `${user.userFirstName} ${user.userLastName}`,

    }
};

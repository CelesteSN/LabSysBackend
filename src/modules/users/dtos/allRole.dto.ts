import {Role} from "../models/role.model";


export type AllRoleDto = {
    id: string;
    name: string;
    
  };
  
  export function mapRoleToDto(role: Role): AllRoleDto {
    return {
      id: role.roleId,
      name: role.roleName
    }
    };
  
  


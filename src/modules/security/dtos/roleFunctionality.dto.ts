import RoleFunctionality  from "../models/roleFunctionality.model";
//import FunctionalityDto from "./functionality.dto";

export type RoleFunctionalityDto = {
   // id: string;
    nameRole: string;
   // functionality: Array<FunctionalityDto>;
    functionality: string[];

  };
  
  export function mapRoleToDto(roleFunctionality: RoleFunctionality): RoleFunctionalityDto {
    return {
     // id : roleFunctionality.Role.roleId,
      nameRole : roleFunctionality.Role.roleName,
      functionality : []
    }
    };
  
  


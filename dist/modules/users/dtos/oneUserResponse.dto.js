"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapOneUserToDto = mapOneUserToDto;
function mapOneUserToDto(user) {
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

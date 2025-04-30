"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToDto = mapUserToDto;
function mapUserToDto(user) {
    return {
        id: user.userId,
        name: `${user.userFirstName} ${user.userLastName}`,
        //email: user.userEmail,
        status: user.UserStatus?.userStatusName || '',
        role: user.Role?.roleName || '',
        createdDate: user.createdDate.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapOneUserToDto = mapOneUserToDto;
function mapOneUserToDto(user) {
    var _a, _b;
    return {
        id: user.userId,
        name: `${user.userFirstName} ${user.userLastName}`,
        dni: user.userDni,
        email: user.userEmail,
        personalFile: user.userPersonalFile,
        phoneNumber: user.userPhoneNumber,
        status: ((_a = user.UserStatus) === null || _a === void 0 ? void 0 : _a.userStatusName) || '',
        role: ((_b = user.Role) === null || _b === void 0 ? void 0 : _b.roleName) || '',
        //   createdDate: user.createdDate.toLocaleDateString('es-AR', {
        //     day: '2-digit',
        //     month: '2-digit',
        //     year: 'numeric',
        // })
    };
}

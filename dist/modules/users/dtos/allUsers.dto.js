"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToDto = mapUserToDto;
function mapUserToDto(user) {
    var _a, _b;
    return {
        id: user.userId,
        name: `${user.userFirstName} ${user.userLastName}`,
        //email: user.userEmail,
        status: ((_a = user.UserStatus) === null || _a === void 0 ? void 0 : _a.userStatusName) || '',
        role: ((_b = user.Role) === null || _b === void 0 ? void 0 : _b.roleName) || '',
        createdDate: user.createdDate.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    };
}

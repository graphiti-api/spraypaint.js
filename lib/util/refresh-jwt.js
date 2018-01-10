"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function refreshJWT(klass, serverResponse) {
    var jwt = serverResponse.headers.get('X-JWT');
    if (jwt) {
        klass.setJWT(jwt);
    }
}
exports.refreshJWT = refreshJWT;
//# sourceMappingURL=refresh-jwt.js.map
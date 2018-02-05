"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NullStorageBackend = /** @class */ (function () {
    function NullStorageBackend() {
    }
    NullStorageBackend.prototype.getItem = function (key) {
        return null;
    };
    NullStorageBackend.prototype.setItem = function (key, value) {
        /*noop*/
    };
    NullStorageBackend.prototype.removeItem = function (key) {
        /*noop*/
    };
    return NullStorageBackend;
}());
exports.NullStorageBackend = NullStorageBackend;
var defaultBackend;
// In case no localStorage available, defauilt to a noop implementation
try {
    defaultBackend = localStorage;
}
catch (e) {
    defaultBackend = new NullStorageBackend();
}
var CredentialStorage = /** @class */ (function () {
    function CredentialStorage(jwtKey, backend) {
        if (backend === void 0) { backend = defaultBackend; }
        this._jwtKey = jwtKey;
        this._backend = backend;
    }
    CredentialStorage.prototype.getJWT = function () {
        if (this._jwtKey) {
            return this._backend.getItem(this._jwtKey);
        }
        else {
            return null;
        }
    };
    CredentialStorage.prototype.setJWT = function (value) {
        if (this._jwtKey) {
            if (value) {
                this._backend.setItem(this._jwtKey, value);
            }
            else {
                this._backend.removeItem(this._jwtKey);
            }
        }
    };
    return CredentialStorage;
}());
exports.CredentialStorage = CredentialStorage;
//# sourceMappingURL=credential-storage.js.map
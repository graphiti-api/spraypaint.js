"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NullStorageBackend = /** @class */ (function () {
    function NullStorageBackend() {
    }
    NullStorageBackend.prototype.getItem = function (key) { return null; };
    NullStorageBackend.prototype.setItem = function (key, value) { };
    NullStorageBackend.prototype.removeItem = function (key) { };
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
var LocalStorage = /** @class */ (function () {
    function LocalStorage(jwtKey, backend) {
        if (backend === void 0) { backend = defaultBackend; }
        this._jwtKey = jwtKey;
        this._backend = backend;
    }
    LocalStorage.prototype.getJWT = function () {
        if (this._jwtKey) {
            return this._backend.getItem(this._jwtKey);
        }
        else {
            return null;
        }
    };
    LocalStorage.prototype.setJWT = function (value) {
        if (this._jwtKey) {
            if (value) {
                this._backend.setItem(this._jwtKey, value);
            }
            else {
                this._backend.removeItem(this._jwtKey);
            }
        }
    };
    return LocalStorage;
}());
exports.LocalStorage = LocalStorage;
//# sourceMappingURL=local-storage.js.map
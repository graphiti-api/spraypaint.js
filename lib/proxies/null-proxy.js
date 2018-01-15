"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NullProxy = /** @class */ (function () {
    function NullProxy(raw_json) {
        this._raw_json = raw_json;
    }
    Object.defineProperty(NullProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NullProxy.prototype, "data", {
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NullProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: true,
        configurable: true
    });
    return NullProxy;
}());
exports.NullProxy = NullProxy;
//# sourceMappingURL=null-proxy.js.map
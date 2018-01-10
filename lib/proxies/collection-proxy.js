"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CollectionProxy = /** @class */ (function () {
    function CollectionProxy(collection, raw_json) {
        if (raw_json === void 0) { raw_json = { data: [] }; }
        this._collection = collection;
        this._raw_json = raw_json;
    }
    Object.defineProperty(CollectionProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionProxy.prototype, "data", {
        get: function () {
            return this._collection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: true,
        configurable: true
    });
    return CollectionProxy;
}());
exports.CollectionProxy = CollectionProxy;
//# sourceMappingURL=collection-proxy.js.map
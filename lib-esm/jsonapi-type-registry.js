var JsonapiTypeRegistry = /** @class */ (function () {
    function JsonapiTypeRegistry(base) {
        this._typeMap = {};
        this._baseClass = base;
    }
    JsonapiTypeRegistry.prototype.register = function (type, model) {
        if (this._typeMap[type]) {
            throw new Error("Type \"" + type + "\" already registered on base class " + this._baseClass);
        }
        this._typeMap[type] = model;
    };
    JsonapiTypeRegistry.prototype.get = function (type) {
        return this._typeMap[type];
    };
    return JsonapiTypeRegistry;
}());
export { JsonapiTypeRegistry };
//# sourceMappingURL=jsonapi-type-registry.js.map
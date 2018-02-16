import { JSORMBase } from "./model";
var ValidationError = /** @class */ (function () {
    function ValidationError(options) {
        var key;
        for (key in options) {
            this[key] = options[key];
        }
    }
    return ValidationError;
}());
export { ValidationError };
var f = new JSORMBase();
//# sourceMappingURL=validation-errors.js.map
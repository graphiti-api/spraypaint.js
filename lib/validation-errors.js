"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("./model");
var ValidationError = /** @class */ (function () {
    function ValidationError(options) {
        var key;
        for (key in options) {
            this[key] = options[key];
        }
    }
    return ValidationError;
}());
exports.ValidationError = ValidationError;
var f = new model_1.JSORMBase();
//# sourceMappingURL=validation-errors.js.map
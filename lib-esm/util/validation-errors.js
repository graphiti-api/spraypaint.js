import { camelize } from "inflected";
var ValidationErrors = /** @class */ (function () {
    function ValidationErrors(model, payload) {
        this.model = model;
        this.payload = payload;
    }
    ValidationErrors.apply = function (model, payload) {
        var instance = new ValidationErrors(model, payload);
        instance.apply();
    };
    ValidationErrors.prototype.apply = function () {
        var _this = this;
        var errorsAccumulator = {};
        if (!this.payload.errors) {
            return;
        }
        this.payload.errors.forEach(function (err) {
            var meta = err.meta;
            var metaRelationship = meta.relationship;
            if (metaRelationship) {
                _this._processRelationship(_this.model, metaRelationship);
            }
            else {
                _this._processResource(errorsAccumulator, meta);
            }
        });
        this.model.errors = errorsAccumulator;
    };
    ValidationErrors.prototype._processResource = function (errorsAccumulator, meta) {
        var attribute = meta.attribute;
        if (this.model.klass.camelizeKeys) {
            attribute = camelize(attribute, false);
        }
        errorsAccumulator[attribute] = meta.message;
    };
    ValidationErrors.prototype._processRelationship = function (model, meta) {
        var relatedObject = model[meta.name];
        if (Array.isArray(relatedObject)) {
            relatedObject = relatedObject.find(function (r) {
                return r.id === meta.id || r.temp_id === meta["temp-id"];
            });
        }
        if (meta.relationship) {
            this._processRelationship(relatedObject, meta.relationship);
        }
        else {
            var relatedAccumulator_1 = {};
            this._processResource(relatedAccumulator_1, meta);
            // make sure to assign a new error object, instead of mutating
            // the existing one, otherwise js frameworks with object tracking
            // won't be able to keep up. Validate vue.js when changing this code:
            var newErrs_1 = {};
            Object.keys(relatedObject.errors).forEach(function (key) {
                newErrs_1[key] = relatedObject.errors[key];
            });
            Object.keys(relatedAccumulator_1).forEach(function (key) {
                newErrs_1[key] = relatedAccumulator_1[key];
            });
            relatedObject.errors = newErrs_1;
        }
    };
    return ValidationErrors;
}());
export { ValidationErrors };
//# sourceMappingURL=validation-errors.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ValidationErrorBuilder = /** @class */ (function () {
    function ValidationErrorBuilder(model, payload) {
        this.model = model;
        this.payload = payload;
    }
    ValidationErrorBuilder.apply = function (model, payload) {
        var instance = new ValidationErrorBuilder(model, payload);
        instance.apply();
    };
    ValidationErrorBuilder.prototype.apply = function () {
        var _this = this;
        var errorsAccumulator = {};
        if (!this.payload.errors) {
            return;
        }
        this.payload.errors.forEach(function (err) {
            var meta = err.meta;
            var metaRelationship = meta.relationship;
            if (metaRelationship) {
                _this._processRelationship(_this.model, metaRelationship, err);
            }
            else {
                _this._processResource(errorsAccumulator, meta, err);
            }
        });
        this.model.errors = errorsAccumulator;
    };
    ValidationErrorBuilder.prototype._processResource = function (errorsAccumulator, meta, error) {
        var attribute = this.model.klass.deserializeKey(meta.attribute);
        errorsAccumulator[attribute] = {
            title: error.title,
            code: error.code,
            attribute: meta.attribute,
            message: meta.message,
            fullMessage: attribute === "base" ? meta.message : error.detail,
            rawPayload: error,
        };
    };
    ValidationErrorBuilder.prototype._processRelationship = function (model, meta, err) {
        var relatedObject = model[meta.name];
        if (Array.isArray(relatedObject)) {
            relatedObject = relatedObject.find(function (r) {
                return r.id === meta.id || r.temp_id === meta["temp-id"];
            });
        }
        if (meta.relationship) {
            this._processRelationship(relatedObject, meta.relationship, err);
        }
        else {
            var relatedAccumulator_1 = {};
            this._processResource(relatedAccumulator_1, meta, err);
            // make sure to assign a new error object, instead of mutating
            // the existing one, otherwise js frameworks with object tracking
            // won't be able to keep up. Validate vue.js when changing this code:
            var newErrs_1 = {};
            Object.keys(relatedObject.errors).forEach(function (key) {
                newErrs_1[key] = relatedObject.errors[key];
            });
            Object.keys(relatedAccumulator_1).forEach(function (key) {
                var error = relatedAccumulator_1[key];
                if (error !== undefined) {
                    newErrs_1[key] = error;
                }
            });
            relatedObject.errors = newErrs_1;
        }
    };
    return ValidationErrorBuilder;
}());
exports.ValidationErrorBuilder = ValidationErrorBuilder;
//# sourceMappingURL=validation-error-builder.js.map
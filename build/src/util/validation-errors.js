"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var string_1 = require("./string");
var ValidationErrors = /** @class */ (function () {
    function ValidationErrors(model, payload) {
        this.payload = [];
        this.model = model;
        this.payload = payload;
    }
    ValidationErrors.apply = function (model, payload) {
        var instance = new ValidationErrors(model, payload);
        var errors = instance.apply();
    };
    ValidationErrors.prototype.apply = function () {
        var _this = this;
        var errorsAccumulator = {};
        this.payload['errors'].forEach(function (err) {
            var meta = err['meta'];
            var metaRelationship = meta['relationship'];
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
        var attribute = meta['attribute'];
        if (this.model.klass.camelizeKeys) {
            attribute = string_1.camelize(attribute);
        }
        errorsAccumulator[attribute] = meta['message'];
    };
    ValidationErrors.prototype._processRelationship = function (model, meta) {
        var relatedObject = model[meta['name']];
        if (Array.isArray(relatedObject)) {
            relatedObject = relatedObject.find(function (r) {
                return (r.id === meta['id'] || r.temp_id === meta['temp-id']);
            });
        }
        if (meta['relationship']) {
            this._processRelationship(relatedObject, meta['relationship']);
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
exports.default = ValidationErrors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi1lcnJvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC92YWxpZGF0aW9uLWVycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1DQUFtQztBQUVuQztJQUlFLDBCQUFZLEtBQVksRUFBRSxPQUFzQjtRQUZoRCxZQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBRU0sc0JBQUssR0FBWixVQUFhLEtBQVksRUFBRSxPQUFzQjtRQUMvQyxJQUFJLFFBQVEsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELGdDQUFLLEdBQUw7UUFBQSxpQkFlQztRQWRDLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFBO1FBRTFCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztZQUNqQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkIsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFNUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixLQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixLQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUE7SUFDdkMsQ0FBQztJQUVPLDJDQUFnQixHQUF4QixVQUF5QixpQkFBeUIsRUFBRSxJQUFZO1FBQzlELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUVqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLFNBQVMsR0FBRyxpQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pDLENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVPLCtDQUFvQixHQUE1QixVQUE2QixLQUFZLEVBQUUsSUFBWTtRQUNyRCxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDO2dCQUNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLG9CQUFrQixHQUFHLEVBQUUsQ0FBQTtZQUMzQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFaEQsOERBQThEO1lBQzlELGlFQUFpRTtZQUNqRSxxRUFBcUU7WUFDckUsSUFBSSxTQUFPLEdBQUcsRUFBRSxDQUFBO1lBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUc7Z0JBQzVDLFNBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUc7Z0JBQzFDLFNBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxvQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN4QyxDQUFDLENBQUMsQ0FBQztZQUNILGFBQWEsQ0FBQyxNQUFNLEdBQUcsU0FBTyxDQUFBO1FBQ2hDLENBQUM7SUFDSCxDQUFDO0lBQ0gsdUJBQUM7QUFBRCxDQUFDLEFBcEVELElBb0VDIn0=
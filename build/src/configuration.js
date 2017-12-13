"use strict";
/// <reference path="../types/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var attribute_1 = require("./attribute");
var logger_1 = require("./logger");
var clonedeep_1 = require("./util/clonedeep");
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.setup = function (options) {
        if (!options)
            options = {};
        if (options.jwtLocalStorage) {
            this.jwtLocalStorage = options.jwtLocalStorage;
        }
        for (var _i = 0, _a = this.models; _i < _a.length; _i++) {
            var model = _a[_i];
            this.typeMapping[model.jsonapiType] = model;
            if (options.jwtOwners && options.jwtOwners.indexOf(model) !== -1) {
                model.isJWTOwner = true;
                if (this.jwtLocalStorage) {
                    model.jwt = this.localStorage.getItem(this.jwtLocalStorage);
                }
            }
        }
        for (var _b = 0, _c = this.models; _b < _c.length; _b++) {
            var model = _c[_b];
            attribute_1.default.applyAll(model);
        }
        for (var _d = 0, _e = this.models; _d < _e.length; _d++) {
            var model = _e[_d];
            var parentAttrList = clonedeep_1.default(model.parentClass.attributeList);
            var attrList = clonedeep_1.default(model.attributeList);
            model.attributeList = Object.assign(parentAttrList, attrList);
        }
    };
    Config.reset = function () {
        this.typeMapping = {};
        this.models = [];
    };
    Config.modelForType = function (type) {
        var klass = this.typeMapping[type];
        if (klass) {
            return klass;
        }
        else {
            throw ("Could not find class for jsonapi type \"" + type + "\"");
        }
    };
    Config.models = [];
    Config.logger = new logger_1.default();
    Config.jwtLocalStorage = 'jwt';
    return Config;
}());
exports.default = Config;
// In node, no localStorage available
// We do this so we can mock it
try {
    Config.localStorage = localStorage;
}
catch (e) {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0Q0FBNEM7O0FBRzVDLHlDQUFvQztBQUNwQyxtQ0FBOEI7QUFDOUIsOENBQXlDO0FBT3pDO0lBQUE7SUFrREEsQ0FBQztJQTNDUSxZQUFLLEdBQVosVUFBYSxPQUF5QjtRQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFM0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFBO1FBQ2hELENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBYyxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXO1lBQXhCLElBQUksS0FBSyxTQUFBO1lBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRTVDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFFeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO1lBQ0gsQ0FBQztTQUNGO1FBRUQsR0FBRyxDQUFDLENBQWMsVUFBVyxFQUFYLEtBQUEsSUFBSSxDQUFDLE1BQU0sRUFBWCxjQUFXLEVBQVgsSUFBVztZQUF4QixJQUFJLEtBQUssU0FBQTtZQUNaLG1CQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNCO1FBRUQsR0FBRyxDQUFDLENBQWMsVUFBVyxFQUFYLEtBQUEsSUFBSSxDQUFDLE1BQU0sRUFBWCxjQUFXLEVBQVgsSUFBVztZQUF4QixJQUFJLEtBQUssU0FBQTtZQUNaLElBQUksY0FBYyxHQUFHLG1CQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNoRSxJQUFJLFFBQVEsR0FBRyxtQkFBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM5QyxLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQy9EO0lBQ0gsQ0FBQztJQUVNLFlBQUssR0FBWjtRQUNFLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFTSxtQkFBWSxHQUFuQixVQUFvQixJQUFZO1FBQzlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFLLENBQUMsNkNBQTBDLElBQUksT0FBRyxDQUFDLENBQUE7UUFDMUQsQ0FBQztJQUNILENBQUM7SUFoRE0sYUFBTSxHQUF5QixFQUFFLENBQUM7SUFFbEMsYUFBTSxHQUFXLElBQUksZ0JBQU0sRUFBRSxDQUFDO0lBQzlCLHNCQUFlLEdBQW1CLEtBQUssQ0FBQztJQThDakQsYUFBQztDQUFBLEFBbERELElBa0RDO2tCQWxEb0IsTUFBTTtBQW9EM0IscUNBQXFDO0FBQ3JDLCtCQUErQjtBQUMvQixJQUFJLENBQUM7SUFDSCxNQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtBQUNwQyxDQUFDO0FBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNaLENBQUMifQ==
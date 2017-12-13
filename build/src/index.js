"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("object-assign-shim");
var es6Promise = require("es6-promise");
es6Promise.polyfill();
var custom_extend_1 = require("./custom-extend");
exports.patchExtends = custom_extend_1.default;
custom_extend_1.default();
var configuration_1 = require("./configuration");
exports.Config = configuration_1.default;
var model_1 = require("./model");
exports.Model = model_1.default;
var attribute_1 = require("./attribute");
var attr_decorator_1 = require("./util/attr-decorator");
exports.attrDecorator = attr_decorator_1.default;
var associations_1 = require("./associations");
exports.hasMany = associations_1.hasMany;
exports.hasOne = associations_1.hasOne;
exports.belongsTo = associations_1.belongsTo;
var attr = function (opts) {
    return new attribute_1.default(opts);
};
exports.attr = attr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4QkFBNEI7QUFDNUIsd0NBQTBDO0FBQzFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUV0QixpREFBMkM7QUFhOEIsdUJBYmxFLHVCQUFZLENBYWtFO0FBWnJGLHVCQUFZLEVBQUUsQ0FBQztBQUVmLGlEQUFxQztBQVU1QixpQkFWRix1QkFBTSxDQVVFO0FBVGYsaUNBQTRCO0FBU1gsZ0JBVFYsZUFBSyxDQVNVO0FBUnRCLHlDQUFvQztBQUNwQyx3REFBa0Q7QUFPcEIsd0JBUHZCLHdCQUFhLENBT3VCO0FBTjNDLCtDQUE0RDtBQU1mLGtCQU5wQyxzQkFBTyxDQU1vQztBQUFFLGlCQU5wQyxxQkFBTSxDQU1vQztBQUFFLG9CQU5wQyx3QkFBUyxDQU1vQztBQUp2RSxJQUFNLElBQUksR0FBRyxVQUFTLElBQXVCO0lBQzNDLE1BQU0sQ0FBQyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDO0FBRXNCLG9CQUFJIn0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var underscore = function (str) {
    return str.replace(/([A-Z])/g, function ($1) { return "_" + $1.toLowerCase(); });
};
exports.underscore = underscore;
var camelize = function (str) {
    return str.replace(/(\_[a-z])/g, function ($1) { return $1.toUpperCase().replace('_', ''); });
};
exports.camelize = camelize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTSxVQUFVLEdBQUcsVUFBUyxHQUFZO0lBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFTLEVBQUUsSUFBRSxNQUFNLENBQUMsR0FBRyxHQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzdFLENBQUMsQ0FBQTtBQU1RLGdDQUFVO0FBSm5CLElBQU0sUUFBUSxHQUFHLFVBQVMsR0FBWTtJQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsVUFBUyxFQUFFLElBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7QUFDM0YsQ0FBQyxDQUFBO0FBRW9CLDRCQUFRIn0=
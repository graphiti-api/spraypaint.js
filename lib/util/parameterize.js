"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parameterize = function (obj, prefix) {
    var str = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var value = obj[key];
            if (value !== undefined && value !== null && value !== "") {
                if (prefix) {
                    key = prefix + "[" + key + "]";
                }
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        str.push(key + "=" + value.join(","));
                    }
                }
                else if (typeof value === "object") {
                    str.push(parameterize(value, key));
                }
                else {
                    str.push(key + "=" + value);
                }
            }
        }
    }
    // remove blanks
    str = str.filter(function (p) {
        return !!p;
    });
    return str.join("&");
};
exports.default = parameterize;
//# sourceMappingURL=parameterize.js.map
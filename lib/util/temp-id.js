"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var memo = 0;
var generate = function () {
    memo++;
    return "temp-id-" + memo;
};
exports.generateTempId = generate;
var tempId = {
    generate: generate
};
exports.tempId = tempId;
//# sourceMappingURL=temp-id.js.map
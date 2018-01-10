"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(decorator) {
    return function (target, attrName, descriptor) {
        if (!target['__attrDecorators'])
            target['__attrDecorators'] = [];
        target['__attrDecorators'].push({ attrName: attrName, decorator: decorator });
    };
}
exports.default = default_1;
//# sourceMappingURL=attr-decorator.js.map
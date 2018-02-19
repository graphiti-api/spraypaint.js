"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flipEnumerable(instance, props, to) {
    props.forEach(function (propName) {
        var descriptor = Object.getOwnPropertyDescriptor(instance, propName);
        if (descriptor) {
            descriptor.enumerable = to;
            Object.defineProperty(instance, propName, descriptor);
        }
    });
}
exports.flipEnumerable = flipEnumerable;
function getNonEnumerables(instance) {
    var nonEnums = [];
    Object.getOwnPropertyNames(instance).forEach(function (propName) {
        var descriptor = Object.getOwnPropertyDescriptor(instance, propName);
        if (descriptor && !descriptor.enumerable) {
            nonEnums.push(propName);
        }
    });
    return nonEnums;
}
exports.getNonEnumerables = getNonEnumerables;
//# sourceMappingURL=enumerables.js.map
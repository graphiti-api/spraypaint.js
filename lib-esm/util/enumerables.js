export function flipEnumerable(instance, props, to) {
    props.forEach(function (propName) {
        var descriptor = Object.getOwnPropertyDescriptor(instance, propName);
        if (descriptor) {
            descriptor.enumerable = to;
            Object.defineProperty(instance, propName, descriptor);
        }
    });
}
export function getNonEnumerables(instance) {
    var nonEnums = [];
    Object.getOwnPropertyNames(instance).forEach(function (propName) {
        var descriptor = Object.getOwnPropertyDescriptor(instance, propName);
        if (descriptor && !descriptor.enumerable) {
            nonEnums.push(propName);
        }
    });
    return nonEnums;
}
//# sourceMappingURL=enumerables.js.map
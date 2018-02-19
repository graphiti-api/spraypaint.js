export var nonenumerable = function (target, key) {
    // first property defined in prototype, that's why we use getters/setters
    // (otherwise assignment in object will override property in prototype)
    Object.defineProperty(target, key, {
        get: function () {
            return undefined;
        },
        set: function (val) {
            // here we have reference to instance and can set property directly to it
            Object.defineProperty(this, key, {
                value: val,
                writable: true,
                configurable: true,
                enumerable: false
            });
        },
        configurable: true,
        enumerable: false
    });
};
//# sourceMappingURL=decorators.js.map
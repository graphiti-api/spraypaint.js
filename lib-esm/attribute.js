export var attr = function (options) {
    if (!options) {
        options = {};
    }
    return new Attribute(options);
};
var Attribute = /** @class */ (function () {
    function Attribute(options) {
        this.isRelationship = false;
        this.type = undefined;
        this.persist = true;
        if (!options) {
            return;
        }
        if (options.name) {
            this.name = options.name;
        }
        if (options.type) {
            this.type = options.type;
        }
        if (options.persist !== undefined) {
            this.persist = !!options.persist;
        }
    }
    Attribute.prototype.apply = function (ModelClass) {
        Object.defineProperty(ModelClass.prototype, this.name, this.descriptor());
    };
    // The model calls this setter
    Attribute.prototype.setter = function (context, val) {
        var privateContext = context;
        privateContext._attributes[this.name] = val;
    };
    // The model calls this getter
    Attribute.prototype.getter = function (context) {
        return context.attributes[this.name];
    };
    // This returns the getters/setters for use on the *model*
    Attribute.prototype.descriptor = function () {
        var attrDef = this;
        return {
            configurable: true,
            enumerable: true,
            get: function () {
                return attrDef.getter(this);
            },
            set: function (value) {
                attrDef.setter(this, value);
            }
        };
    };
    return Attribute;
}());
export { Attribute };
var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;
/*
 *  Function taken from VueJS's props assertion code here:
 *  https://github.com/vuejs/vue/blob/1dd6b6f046c3093950e599ccc6bbe7a393b8a494/src/core/util/props.js
 *
 *  We aren't using this yet, but I don't want to lose the reference
 *  to it so I'm keeping it around.
 *
 */
var assertType = function (value, type) {
    var valid;
    var expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
        var t = typeof value;
        valid = t === expectedType.toLowerCase();
        // for primitive wrapper objects
        if (!valid && t === "object") {
            valid = value instanceof type;
        }
    }
    else if (expectedType === "Object") {
        valid = isPlainObject(value);
    }
    else if (expectedType === "Array") {
        valid = Array.isArray(value);
    }
    else {
        valid = value instanceof type;
    }
    return {
        valid: valid,
        expectedType: expectedType
    };
};
/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
/* tslint:disable-next-line:ban-types */
var getType = function (fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : "";
};
var isType = function (type, fn) {
    if (!Array.isArray(fn)) {
        return getType(fn) === getType(type);
    }
    for (var i = 0, len = fn.length; i < len; i++) {
        if (getType(fn[i]) === getType(type)) {
            return true;
        }
    }
    return false;
};
/**
 * Get the raw type string of a value e.g. [object Object]
 */
var _toString = Object.prototype.toString;
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var isPlainObject = function (obj) {
    return _toString.call(obj) === "[object Object]";
};
//# sourceMappingURL=attribute.js.map
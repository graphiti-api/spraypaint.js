var IncludeDirective = /** @class */ (function () {
    function IncludeDirective(arg) {
        this.dct = {};
        var includeHash = this._parseIncludeArgs(arg);
        for (var key in includeHash) {
            if (includeHash.hasOwnProperty(key)) {
                this.dct[key] = new IncludeDirective(includeHash[key]);
            }
        }
    }
    IncludeDirective.prototype.toScopeObject = function () {
        var hash = {};
        for (var key in this.dct) {
            if (this.dct.hasOwnProperty(key)) {
                hash[key] = this.dct[key].toScopeObject();
            }
        }
        return hash;
    };
    IncludeDirective.prototype.toString = function () {
        var stringArray = [];
        var _loop_1 = function (key) {
            if (this_1.dct.hasOwnProperty(key)) {
                var stringValue = this_1.dct[key].toString();
                if (stringValue === "") {
                    stringArray.push(key);
                }
                else {
                    var split = stringValue.split(",");
                    split = split.map(function (x) { return key + "." + x; });
                    stringArray.push(split.join(","));
                }
            }
        };
        var this_1 = this;
        for (var key in this.dct) {
            _loop_1(key);
        }
        return stringArray.join(",");
    };
    IncludeDirective.prototype._parseIncludeArgs = function (includeArgs) {
        if (Array.isArray(includeArgs)) {
            return this._parseArray(includeArgs);
        }
        else if (typeof includeArgs === "string") {
            var obj = {};
            obj[includeArgs] = {};
            return obj;
        }
        else if (typeof includeArgs === "object") {
            return this._parseObject(includeArgs);
        }
        else {
            return {};
        }
    };
    IncludeDirective.prototype._parseObject = function (includeObj) {
        var parsed = {};
        for (var key in includeObj) {
            if (includeObj.hasOwnProperty(key)) {
                parsed[key] = this._parseIncludeArgs(includeObj[key]);
            }
        }
        return parsed;
    };
    IncludeDirective.prototype._parseArray = function (includeArray) {
        var parsed = {};
        for (var _i = 0, includeArray_1 = includeArray; _i < includeArray_1.length; _i++) {
            var value = includeArray_1[_i];
            var parsedEl = this._parseIncludeArgs(value);
            for (var key in parsedEl) {
                if (parsedEl.hasOwnProperty(key)) {
                    parsed[key] = parsedEl[key];
                }
            }
        }
        return parsed;
    };
    return IncludeDirective;
}());
export { IncludeDirective };
//# sourceMappingURL=include-directive.js.map
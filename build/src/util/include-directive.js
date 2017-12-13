"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IncludeDirective = /** @class */ (function () {
    function IncludeDirective(obj) {
        this.dct = {};
        var includeHash = this.parseIncludeArgs(obj);
        for (var key in includeHash) {
            this.dct[key] = new IncludeDirective(includeHash[key]);
        }
    }
    IncludeDirective.prototype.toObject = function () {
        var hash = {};
        for (var key in this.dct) {
            hash[key] = this.dct[key].toObject();
        }
        return hash;
    };
    IncludeDirective.prototype.toString = function () {
        var stringArray = [];
        var _loop_1 = function (key) {
            var stringValue = this_1.dct[key].toString();
            if (stringValue === '') {
                stringArray.push(key);
            }
            else {
                stringValue = stringValue.split(',');
                stringValue = stringValue.map(function (x) { return key + "." + x; });
                stringArray.push(stringValue.join(','));
            }
        };
        var this_1 = this;
        for (var key in this.dct) {
            _loop_1(key);
        }
        return stringArray.join(',');
    };
    IncludeDirective.prototype.parseIncludeArgs = function (includeArgs) {
        if (Array.isArray(includeArgs)) {
            return this._parseArray(includeArgs);
        }
        else if (typeof includeArgs == "string") {
            var obj = {};
            obj[includeArgs] = {};
            return obj;
        }
        else if (typeof includeArgs == "object") {
            return this._parseObject(includeArgs);
        }
        else {
            return {};
        }
    };
    // private
    IncludeDirective.prototype._parseObject = function (includeObj) {
        var parsed = {};
        for (var key in includeObj) {
            parsed[key] = this.parseIncludeArgs(includeObj[key]);
        }
        return parsed;
    };
    IncludeDirective.prototype._parseArray = function (includeArray) {
        var parsed = {};
        for (var _i = 0, includeArray_1 = includeArray; _i < includeArray_1.length; _i++) {
            var value = includeArray_1[_i];
            var parsedEl = this.parseIncludeArgs(value);
            for (var key in parsedEl) {
                parsed[key] = parsedEl[key];
            }
        }
        return parsed;
    };
    return IncludeDirective;
}());
exports.default = IncludeDirective;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jbHVkZS1kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9pbmNsdWRlLWRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0lBR0UsMEJBQVksR0FBaUM7UUFGN0MsUUFBRyxHQUFXLEVBQUUsQ0FBQztRQUdmLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU3QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0gsQ0FBQztJQUVELG1DQUFRLEdBQVI7UUFDRSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxtQ0FBUSxHQUFSO1FBQ0UsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO2dDQUNaLEdBQUc7WUFDVixJQUFJLFdBQVcsR0FBRyxPQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUzQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sV0FB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
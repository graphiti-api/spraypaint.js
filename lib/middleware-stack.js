"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MiddlewareStack = /** @class */ (function () {
    function MiddlewareStack(before, after) {
        if (before === void 0) { before = []; }
        if (after === void 0) { after = []; }
        this._beforeFilters = [];
        this._afterFilters = [];
        this._beforeFilters = before;
        this._afterFilters = after;
    }
    Object.defineProperty(MiddlewareStack.prototype, "beforeFilters", {
        get: function () {
            return this._beforeFilters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MiddlewareStack.prototype, "afterFilters", {
        get: function () {
            return this._afterFilters;
        },
        enumerable: true,
        configurable: true
    });
    MiddlewareStack.prototype.beforeFetch = function (requestUrl, options) {
        this._beforeFilters.forEach(function (filter) {
            filter(requestUrl, options);
        });
    };
    MiddlewareStack.prototype.afterFetch = function (response, json) {
        this._afterFilters.forEach(function (filter) {
            filter(response, json);
        });
    };
    return MiddlewareStack;
}());
exports.MiddlewareStack = MiddlewareStack;
//# sourceMappingURL=middleware-stack.js.map
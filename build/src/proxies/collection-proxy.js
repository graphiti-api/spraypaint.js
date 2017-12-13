"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("../model");
var CollectionProxy = /** @class */ (function () {
    function CollectionProxy(raw_json) {
        if (raw_json === void 0) { raw_json = { data: [] }; }
        var _this = this;
        this.setRaw = function (json_payload) {
            _this._raw_json = json_payload;
            _this._array = [];
            _this.raw.data.map(function (datum) {
                _this._array.push(model_1.default.fromJsonapi(datum, _this.raw));
            });
        };
        this.setRaw(raw_json);
    }
    Object.defineProperty(CollectionProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionProxy.prototype, "data", {
        get: function () {
            return this._array;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: true,
        configurable: true
    });
    return CollectionProxy;
}());
exports.default = CollectionProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi1wcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm94aWVzL2NvbGxlY3Rpb24tcHJveHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQ0FBNkI7QUFFN0I7SUFJRSx5QkFBYSxRQUFpQztRQUFqQyx5QkFBQSxFQUFBLGFBQXVCLElBQUksRUFBRSxFQUFFLEVBQUU7UUFBOUMsaUJBRUM7UUFjTyxXQUFNLEdBQUcsVUFBQyxZQUFzQjtZQUN0QyxLQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztZQUU5QixLQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVqQixLQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFvQjtnQkFDckMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUE7UUF2QkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsc0JBQUksZ0NBQUc7YUFBUDtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksaUNBQUk7YUFBUjtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksaUNBQUk7YUFBUjtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsQ0FBQzs7O09BQUE7SUFXSCxzQkFBQztBQUFELENBQUMsQUE3QkQsSUE2QkM7QUFFRCxrQkFBZSxlQUFlLENBQUMifQ==
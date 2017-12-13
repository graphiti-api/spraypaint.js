"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("../model");
var RecordProxy = /** @class */ (function () {
    function RecordProxy(raw_json) {
        if (raw_json === void 0) { raw_json = { data: [] }; }
        var _this = this;
        this.setRaw = function (json_payload) {
            _this._raw_json = json_payload;
            if (_this.raw.data) {
                _this._model = model_1.default.fromJsonapi(_this.raw.data, _this.raw);
            }
            else {
                _this._model = null;
            }
        };
        this.setRaw(raw_json);
    }
    Object.defineProperty(RecordProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordProxy.prototype, "data", {
        get: function () {
            return this._model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecordProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: true,
        configurable: true
    });
    return RecordProxy;
}());
exports.default = RecordProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkLXByb3h5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3hpZXMvcmVjb3JkLXByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0NBQTZCO0FBRTdCO0lBSUUscUJBQWEsUUFBaUM7UUFBakMseUJBQUEsRUFBQSxhQUF1QixJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQTlDLGlCQUVDO1FBY08sV0FBTSxHQUFHLFVBQUMsWUFBc0I7WUFDdEMsS0FBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7WUFFOUIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixLQUFJLENBQUMsTUFBTSxHQUFHLGVBQUssQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixLQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtZQUNwQixDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBdkJDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELHNCQUFJLDRCQUFHO2FBQVA7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDZCQUFJO2FBQVI7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDZCQUFJO2FBQVI7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBV0gsa0JBQUM7QUFBRCxDQUFDLEFBN0JELElBNkJDO0FBRUQsa0JBQWUsV0FBVyxDQUFDIn0=
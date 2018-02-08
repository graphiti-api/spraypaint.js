"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clonedeep_1 = require("./util/clonedeep");
var event_bus_1 = require("./event-bus");
var IDMap = /** @class */ (function () {
    function IDMap() {
        this.data = {};
    }
    Object.defineProperty(IDMap.prototype, "count", {
        get: function () {
            return Object.keys(this.data).length;
        },
        enumerable: true,
        configurable: true
    });
    IDMap.prototype.find = function (model, key) {
        if (key === void 0) { key = null; }
        if (!key)
            key = model.storeKey;
        return this.data[key];
    };
    IDMap.prototype.findAll = function (models) {
        var _this = this;
        var records = [];
        models.forEach(function (m) {
            var found = _this.find(m);
            if (found) {
                records.push(found);
            }
        });
        return records;
    };
    IDMap.prototype.create = function (model, key) {
        model.storeKey = key;
        model.stale = false;
        this.data[key] = clonedeep_1.cloneDeep(model.attributes);
    };
    IDMap.prototype.updateOrCreate = function (model) {
        if (model.storeKey) {
            this.create(model, model.storeKey);
        }
        else {
            var key = this.keyFor(model);
            this.create(model, key);
        }
        event_bus_1.EventBus.dispatch(model.storeKey, {}, this.data[model.storeKey]);
    };
    IDMap.prototype.destroy = function (model) {
        model.stale = true;
        delete this.data[model.storeKey];
    };
    IDMap.prototype.keyFor = function (model) {
        return model.klass.jsonapiType + "-" + model.id;
    };
    return IDMap;
}());
exports.IDMap = IDMap;
//# sourceMappingURL=id-map.js.map
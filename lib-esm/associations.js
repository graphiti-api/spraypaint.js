import * as tslib_1 from "tslib";
import { Attribute } from "./attribute";
import { JSORMBase } from "./model";
var wasDestroyed = function (model) {
    if (!model.klass.sync)
        return false; // not supported if idmap is off
    return (model.isPersisted || model.stale) && !model.stored;
};
var SingleAssociationBase = /** @class */ (function (_super) {
    tslib_1.__extends(SingleAssociationBase, _super);
    function SingleAssociationBase(options) {
        var _this = _super.call(this, options) || this;
        _this.isRelationship = true;
        if (options.jsonapiType) {
            _this.jsonapiType = options.jsonapiType;
        }
        if (_this.type) {
            _this._klass = _this.type;
        }
        return _this;
    }
    Object.defineProperty(SingleAssociationBase.prototype, "klass", {
        get: function () {
            if (!this._klass) {
                this._klass = modelForType(this, this.jsonapiType);
            }
            return this._klass;
        },
        enumerable: true,
        configurable: true
    });
    SingleAssociationBase.prototype.getter = function (context) {
        var gotten = context.relationships[this.name];
        if (gotten && wasDestroyed(gotten)) {
            delete context.relationships[this.name];
        }
        return context.relationships[this.name];
    };
    SingleAssociationBase.prototype.setter = function (context, val) {
        if (val && !val.hasOwnProperty("isRelationship")) {
            if (!(val instanceof JSORMBase) && !Array.isArray(val)) {
                val = new this.klass(val);
            }
            context.relationships[this.name] = val;
        }
        else if (val === null || val === undefined) {
            context.relationships[this.name] = val;
        }
    };
    return SingleAssociationBase;
}(Attribute));
export { SingleAssociationBase };
var HasMany = /** @class */ (function (_super) {
    tslib_1.__extends(HasMany, _super);
    function HasMany(options) {
        var _this = _super.call(this, options) || this;
        _this.isRelationship = true;
        if (options.jsonapiType) {
            _this.jsonapiType = options.jsonapiType;
        }
        if (_this.type) {
            _this._klass = _this.type;
        }
        return _this;
    }
    Object.defineProperty(HasMany.prototype, "klass", {
        get: function () {
            if (!this._klass) {
                this._klass = modelForType(this, this.jsonapiType);
            }
            return this._klass;
        },
        enumerable: true,
        configurable: true
    });
    HasMany.prototype.getter = function (context) {
        var gotten = context.relationships[this.name];
        if (!gotten) {
            this.setter(context, []);
            return context.relationships[this.name];
        }
        var index = gotten.length;
        while (index--) {
            if (wasDestroyed(gotten[index])) {
                var related = context.relationships[this.name];
                gotten.splice(index, 1);
            }
        }
        return context.relationships[this.name];
    };
    HasMany.prototype.setter = function (context, val) {
        if (val && !val.hasOwnProperty("isRelationship")) {
            if (!(val instanceof JSORMBase) && !Array.isArray(val)) {
                val = new this.klass(val);
            }
            context.relationships[this.name] = val;
        }
        else if (val === null || val === undefined) {
            context.relationships[this.name] = val;
        }
    };
    return HasMany;
}(Attribute));
export { HasMany };
var HasOne = /** @class */ (function (_super) {
    tslib_1.__extends(HasOne, _super);
    function HasOne() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return HasOne;
}(SingleAssociationBase));
export { HasOne };
var BelongsTo = /** @class */ (function (_super) {
    tslib_1.__extends(BelongsTo, _super);
    function BelongsTo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BelongsTo;
}(SingleAssociationBase));
export { BelongsTo };
export var hasOne = function (options) {
    var opts = extractAssocOpts(options);
    return new HasOne(opts);
};
export var belongsTo = function (options) {
    var opts = extractAssocOpts(options);
    return new BelongsTo(opts);
};
export var hasMany = function (options) {
    var opts = extractAssocOpts(options);
    return new HasMany(opts);
};
var extractAssocOpts = function (options) {
    var associationOpts = {};
    if (options !== undefined) {
        if (typeof options === "string") {
            associationOpts = {
                jsonapiType: options
            };
        }
        else {
            associationOpts = {
                persist: options.persist,
                name: options.name
            };
            if (typeof options.type === "string") {
                associationOpts.jsonapiType = options.type;
            }
            else {
                associationOpts.type = options.type;
            }
        }
    }
    return associationOpts;
};
var modelForType = function (association, jsonapiType) {
    var klass = association.owner.typeRegistry.get(jsonapiType);
    if (klass) {
        return klass;
    }
    else {
        throw new Error("Unknown type \"" + jsonapiType + "\"");
    }
};
//# sourceMappingURL=associations.js.map
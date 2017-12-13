"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var attribute_1 = require("./attribute");
var model_1 = require("./model");
// Not sure why this is needed, already patching in main..
var custom_extend_1 = require("./custom-extend");
custom_extend_1.default();
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.isRelationship = true;
        _this.jsonapiType = args[0];
        return _this;
    }
    Base.prototype.getter = function (context) {
        return context.relationships[this.name];
    };
    Base.prototype.setter = function (context, val) {
        if (val && !val.hasOwnProperty('isRelationship')) {
            if (!(val instanceof model_1.default) && !(Array.isArray(val))) {
                val = new this.klass(val);
            }
            context.relationships[this.name] = val;
        }
        else if (val === null || val === undefined) {
            context.relationships[this.name] = val;
        }
    };
    return Base;
}(attribute_1.default));
exports.Base = Base;
var HasMany = /** @class */ (function (_super) {
    __extends(HasMany, _super);
    function HasMany() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HasMany.prototype.getter = function (context) {
        var gotten = _super.prototype.getter.call(this, context);
        if (!gotten) {
            this.setter(context, []);
            return _super.prototype.getter.call(this, context);
        }
        else {
            return gotten;
        }
    };
    return HasMany;
}(Base));
exports.HasMany = HasMany;
var HasOne = /** @class */ (function (_super) {
    __extends(HasOne, _super);
    function HasOne() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return HasOne;
}(Base));
exports.HasOne = HasOne;
var BelongsTo = /** @class */ (function (_super) {
    __extends(BelongsTo, _super);
    function BelongsTo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BelongsTo;
}(Base));
exports.BelongsTo = BelongsTo;
var hasMany = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new (HasMany.bind.apply(HasMany, [void 0].concat(args)))();
};
exports.hasMany = hasMany;
var hasOne = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new (HasOne.bind.apply(HasOne, [void 0].concat(args)))();
};
exports.hasOne = hasOne;
var belongsTo = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new (BelongsTo.bind.apply(BelongsTo, [void 0].concat(args)))();
};
exports.belongsTo = belongsTo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzb2NpYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Fzc29jaWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFvQztBQUNwQyxpQ0FBNEI7QUFDNUIsMERBQTBEO0FBQzFELGlEQUEyQztBQUMzQyx1QkFBWSxFQUFFLENBQUM7QUFFZjtJQUEwQix3QkFBUztJQUtqQztRQUFZLGNBQWU7YUFBZixVQUFlLEVBQWYscUJBQWUsRUFBZixJQUFlO1lBQWYseUJBQWU7O1FBQTNCLFlBQ0UsaUJBQU8sU0FFUjtRQU5ELG9CQUFjLEdBQUcsSUFBSSxDQUFDO1FBS3BCLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUM3QixDQUFDO0lBRUQscUJBQU0sR0FBTixVQUFPLE9BQWM7UUFDbkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxxQkFBTSxHQUFOLFVBQU8sT0FBYyxFQUFFLEdBQVE7UUFDN0IsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLGVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLENBQUM7WUFDRCxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDekMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN6QyxDQUFDO0lBQ0gsQ0FBQztJQUNILFdBQUM7QUFBRCxDQUFDLEFBeEJELENBQTBCLG1CQUFTLEdBd0JsQztBQXhCWSxvQkFBSTtBQTBCakI7SUFBNkIsMkJBQUk7SUFBakM7O0lBVUEsQ0FBQztJQVRDLHdCQUFNLEdBQU4sVUFBTyxPQUFjO1FBQ25CLElBQUksTUFBTSxHQUFHLGlCQUFNLE1BQU0sWUFBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsaUJBQU0sTUFBTSxZQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEIsQ0FBQztJQUNILENBQUM7SUFDSCxjQUFDO0FBQUQsQ0FBQyxBQVZELENBQTZCLElBQUksR0FVaEM7QUFWWSwwQkFBTztBQVlwQjtJQUE0QiwwQkFBSTtJQUFoQzs7SUFDQSxDQUFDO0lBQUQsYUFBQztBQUFELENBQUMsQUFERCxDQUE0QixJQUFJLEdBQy9CO0FBRFksd0JBQU07QUFHbkI7SUFBK0IsNkJBQUk7SUFBbkM7O0lBQ0EsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FBQyxBQURELENBQStCLElBQUksR0FDbEM7QUFEWSw4QkFBUztBQUd0QixJQUFNLE9BQU8sR0FBRztJQUFTLGNBQU87U0FBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1FBQVAseUJBQU87O0lBQzlCLE1BQU0sTUFBSyxPQUFPLFlBQVAsT0FBTyxrQkFBSSxJQUFJLE1BQUU7QUFDOUIsQ0FBQyxDQUFBO0FBVVEsMEJBQU87QUFSaEIsSUFBTSxNQUFNLEdBQUc7SUFBUyxjQUFPO1NBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztRQUFQLHlCQUFPOztJQUM3QixNQUFNLE1BQUssTUFBTSxZQUFOLE1BQU0sa0JBQUksSUFBSSxNQUFFO0FBQzdCLENBQUMsQ0FBQTtBQU1pQix3QkFBTTtBQUp4QixJQUFNLFNBQVMsR0FBRztJQUFTLGNBQU87U0FBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1FBQVAseUJBQU87O0lBQ2hDLE1BQU0sTUFBSyxTQUFTLFlBQVQsU0FBUyxrQkFBSSxJQUFJLE1BQUU7QUFDaEMsQ0FBQyxDQUFBO0FBRXlCLDhCQUFTIn0=
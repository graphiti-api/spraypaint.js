"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var include_directive_1 = require("./include-directive");
var DirtyChecker = /** @class */ (function () {
    function DirtyChecker(model) {
        this.model = model;
    }
    // Check if we are switching persisted objects. Either:
    // * adding a new already-persisted object to a hasMany array
    // * switching an existing persisted hasOne/belongsTo object
    DirtyChecker.prototype.checkRelation = function (relationName, relatedModel) {
        var dirty = false;
        if (relatedModel.isPersisted()) {
            var identifiers = this.model._originalRelationships[relationName] || [];
            var found = identifiers.find(function (ri) {
                return JSON.stringify(ri) == JSON.stringify(relatedModel.resourceIdentifier);
            });
            if (!found)
                dirty = true;
        }
        return dirty;
    };
    // Either:
    // * attributes changed
    // * marked for destruction / disassociation
    // * not persisted (and thus must be send to server)
    // * not itself dirty, but has nested relations that are dirty
    DirtyChecker.prototype.check = function (relationships) {
        if (relationships === void 0) { relationships = {}; }
        var includeDirective = new include_directive_1.default(relationships);
        var includeHash = includeDirective.toObject();
        return this._hasDirtyAttributes() ||
            this._hasDirtyRelationships(includeHash) ||
            this.model.isMarkedForDestruction() ||
            this.model.isMarkedForDisassociation() ||
            this._isUnpersisted();
    };
    DirtyChecker.prototype.dirtyAttributes = function () {
        var dirty = {};
        for (var _i = 0, _a = Object.keys(this.model.attributes); _i < _a.length; _i++) {
            var key = _a[_i];
            var prior = this.model._originalAttributes[key];
            var current = this.model.attributes[key];
            if (!this.model.isPersisted()) {
                dirty[key] = [null, current];
            }
            else if (prior != current) {
                dirty[key] = [prior, current];
            }
        }
        return dirty;
    };
    // TODO: allow attributes == {} configurable
    DirtyChecker.prototype._isUnpersisted = function () {
        return !this.model.isPersisted() && JSON.stringify(this.model.attributes) !== JSON.stringify({});
    };
    DirtyChecker.prototype._hasDirtyAttributes = function () {
        var originalAttrs = this.model._originalAttributes;
        var currentAttrs = this.model.attributes;
        return JSON.stringify(originalAttrs) !== JSON.stringify(currentAttrs);
    };
    DirtyChecker.prototype._hasDirtyRelationships = function (includeHash) {
        var _this = this;
        var dirty = false;
        this._eachRelatedObject(includeHash, function (relationName, relatedObject, nested) {
            if (relatedObject.isDirty(nested)) {
                dirty = true;
            }
            if (_this.checkRelation(relationName, relatedObject)) {
                dirty = true;
            }
        });
        return dirty;
    };
    DirtyChecker.prototype._eachRelatedObject = function (includeHash, callback) {
        var _this = this;
        Object.keys(includeHash).forEach(function (key) {
            var nested = includeHash[key];
            var relatedObjects = _this.model[key];
            if (!Array.isArray(relatedObjects))
                relatedObjects = [relatedObjects];
            relatedObjects.forEach(function (relatedObject) {
                if (relatedObject) {
                    callback(key, relatedObject, nested);
                }
            });
        });
    };
    return DirtyChecker;
}());
exports.default = DirtyChecker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlydHktY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9kaXJ0eS1jaGVjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHlEQUFtRDtBQUVuRDtJQUdFLHNCQUFZLEtBQVk7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVELHVEQUF1RDtJQUN2RCw2REFBNkQ7SUFDN0QsNERBQTREO0lBQzVELG9DQUFhLEdBQWIsVUFBYyxZQUFvQixFQUFFLFlBQW1CO1FBQ3JELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVsQixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hFLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFFO2dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxVQUFVO0lBQ1YsdUJBQXVCO0lBQ3ZCLDRDQUE0QztJQUM1QyxvREFBb0Q7SUFDcEQsOERBQThEO0lBQzlELDRCQUFLLEdBQUwsVUFBTSxhQUFnRDtRQUFoRCw4QkFBQSxFQUFBLGtCQUFnRDtRQUNwRCxJQUFJLGdCQUFnQixHQUFHLElBQUksMkJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0Qs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
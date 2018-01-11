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
        if (relatedModel.isPersisted) {
            var identifiers = this.model._originalRelationships[relationName] || [];
            var found = identifiers.find(function (ri) {
                return (JSON.stringify(ri) === JSON.stringify(relatedModel.resourceIdentifier));
            });
            if (!found) {
                dirty = true;
            }
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
        var includeDirective = new include_directive_1.IncludeDirective(relationships);
        var includeHash = includeDirective.toScopeObject();
        return (this._hasDirtyAttributes() ||
            this._hasDirtyRelationships(includeHash) ||
            this.model.isMarkedForDestruction ||
            this.model.isMarkedForDisassociation ||
            this._isUnpersisted());
    };
    DirtyChecker.prototype.dirtyAttributes = function () {
        var dirty = {};
        for (var _i = 0, _a = Object.keys(this.model.attributes); _i < _a.length; _i++) {
            var key = _a[_i];
            var prior = this.model._originalAttributes[key];
            var current = this.model.attributes[key];
            if (!this.model.isPersisted) {
                dirty[key] = [null, current];
            }
            else if (prior !== current) {
                dirty[key] = [prior, current];
            }
        }
        return dirty;
    };
    // TODO: allow attributes == {} configurable
    DirtyChecker.prototype._isUnpersisted = function () {
        return (!this.model.isPersisted &&
            JSON.stringify(this.model.attributes) !== JSON.stringify({}));
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
            if (!Array.isArray(relatedObjects)) {
                relatedObjects = [relatedObjects];
            }
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
//# sourceMappingURL=dirty-check.js.map
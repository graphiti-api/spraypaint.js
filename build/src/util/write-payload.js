"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var include_directive_1 = require("./include-directive");
var _snakeCase = require("./snakecase");
var temp_id_1 = require("./temp-id");
var snakeCase = _snakeCase.default || _snakeCase;
snakeCase = snakeCase['default'] || snakeCase;
var WritePayload = /** @class */ (function () {
    function WritePayload(model, relationships) {
        this.included = [];
        var includeDirective = new include_directive_1.default(relationships);
        this.includeDirective = includeDirective.toObject();
        this.model = model;
    }
    WritePayload.prototype.attributes = function () {
        var _this = this;
        var attrs = {};
        this._eachAttribute(function (key, value) {
            var snakeKey = snakeCase(key);
            if (!_this.model.isPersisted() || _this.model.changes()[key]) {
                attrs[snakeKey] = value;
            }
        });
        return attrs;
    };
    WritePayload.prototype.removeDeletions = function (model, includeDirective) {
        var _this = this;
        Object.keys(includeDirective).forEach(function (key) {
            var nested = includeDirective[key];
            var relatedObjects = model[key];
            if (relatedObjects) {
                if (Array.isArray(relatedObjects)) {
                    relatedObjects.forEach(function (relatedObject, index) {
                        if (relatedObject.isMarkedForDestruction() || relatedObject.isMarkedForDisassociation()) {
                            model[key].splice(index, 1);
                        }
                        else {
                            _this.removeDeletions(relatedObject, nested);
                        }
                    });
                }
                else {
                    var relatedObject = relatedObjects;
                    if (relatedObject.isMarkedForDestruction() || relatedObject.isMarkedForDisassociation()) {
                        model[key] = null;
                    }
                    else {
                        _this.removeDeletions(relatedObject, nested);
                    }
                }
            }
        });
    };
    WritePayload.prototype.postProcess = function () {
        this.removeDeletions(this.model, this.includeDirective);
        this.model.resetRelationTracking(this.includeDirective);
    };
    WritePayload.prototype.relationships = function () {
        var _this = this;
        var _relationships = {};
        Object.keys(this.includeDirective).forEach(function (key) {
            var nested = _this.includeDirective[key];
            var data;
            var relatedModels = _this.model[key];
            if (relatedModels) {
                if (Array.isArray(relatedModels)) {
                    data = [];
                    relatedModels.forEach(function (relatedModel) {
                        if (_this.model.hasDirtyRelation(key, relatedModel) || relatedModel.isDirty(nested)) {
                            data.push(_this._processRelatedModel(relatedModel, nested));
                        }
                    });
                    if (data.length === 0)
                        data = null;
                }
                else {
                    // Either the related model is dirty, or it's a dirty relation
                    // (maybe the "department" is not dirty, but the employee changed departments
                    if (_this.model.hasDirtyRelation(key, relatedModels) || relatedModels.isDirty(nested)) {
                        data = _this._processRelatedModel(relatedModels, nested);
                    }
                }
                if (data) {
                    _relationships[key] = { data: data };
                }
            }
        });
        return _relationships;
    };
    WritePayload.prototype.asJSON = function () {
        var data = {};
        this.model.clearErrors();
        if (this.model.id) {
            data['id'] = this.model.id;
        }
        if (this.model.temp_id) {
            data['temp-id'] = this.model.temp_id;
        }
        data['type'] = this.model.klass.jsonapiType;
        var _attributes = this.attributes();
        if (Object.keys(_attributes).length > 0) {
            data['attributes'] = _attributes;
        }
        var relationshipData = this.relationships();
        if (Object.keys(relationshipData).length > 0) {
            data['relationships'] = relationshipData;
        }
        var json = { data: data };
        if (this.included.length > 0) {
            json['included'] = this.included;
        }
        return json;
    };
    // private
    WritePayload.prototype._processRelatedModel = function (model, nested) {
        var _this = this;
        model.clearErrors();
        if (!model.isPersisted()) {
            model.temp_id = temp_id_1.default.generate();
        }
        var wp = new WritePayload(model, nested);
        var relatedJSON = wp.asJSON()['data'];
        var resourceIdentifier = this._resourceIdentifierFor(model);
        this._pushInclude(relatedJSON);
        wp.included.forEach(function (incl) {
            _this._pushInclude(incl);
        });
        return resourceIdentifier;
    };
    WritePayload.prototype._resourceIdentifierFor = function (model) {
        var identifier = {};
        identifier['type'] = model.klass.jsonapiType;
        if (model.id) {
            identifier['id'] = model.id;
        }
        if (model.temp_id) {
            identifier['temp-id'] = model.temp_id;
        }
        var method;
        if (model.isPersisted()) {
            if (model.isMarkedForDestruction()) {
                method = 'destroy';
            }
            else if (model.isMarkedForDisassociation()) {
                method = 'disassociate';
            }
            else {
                method = 'update';
            }
        }
        else {
            method = 'create';
        }
        identifier['method'] = method;
        return identifier;
    };
    WritePayload.prototype._pushInclude = function (include) {
        if (!this._isIncluded(include)) {
            this.included.push(include);
        }
        ;
    };
    WritePayload.prototype._isIncluded = function (include) {
        this.included.forEach(function (incl) {
            if (incl['type'] === include['type']) {
                if (incl['id'] === include['id'] || incl['temp-id'] === include['temp-id']) {
                    return true;
                }
            }
        });
        return false;
    };
    WritePayload.prototype._eachAttribute = function (callback) {
        var _this = this;
        var modelAttrs = this.model.attributes;
        Object.keys(modelAttrs).forEach(function (key) {
            if (_this.model.klass.attributeList[key].persist) {
                var value = modelAttrs[key];
                callback(key, value);
            }
        });
    };
    return WritePayload;
}());
exports.default = WritePayload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGUtcGF5bG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL3dyaXRlLXBheWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5REFBbUQ7QUFDbkQsd0NBQTBDO0FBQzFDLHFDQUErQjtBQUMvQixJQUFJLFNBQVMsR0FBYyxVQUFXLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQztBQUM3RCxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsQ0FBQztBQUU5QztJQUtFLHNCQUFZLEtBQWEsRUFBRSxhQUEyQztRQUZ0RSxhQUFRLEdBQWtCLEVBQUUsQ0FBQztRQUczQixJQUFJLGdCQUFnQixHQUFHLElBQUksMkJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxpQ0FBVSxHQUFWO1FBQUEsaUJBWUM7UUFYQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFZixJQUFJLENBQUMsY0FBYyxDQUFDLFVBQUMsR0FBRyxFQUFFLEtBQUs7WUFDN0IsSUFBSSxRQUFRLEdBQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUMxQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELHNDQUFlLEdBQWYsVUFBZ0IsS0FBWSxFQUFFLGdCQUF3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
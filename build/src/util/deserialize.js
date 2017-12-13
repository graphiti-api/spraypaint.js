"use strict";
/// <reference path="../../types/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("../configuration");
var string_1 = require("./string");
function deserialize(datum, payload) {
    var deserializer = new Deserializer(payload);
    return deserializer.deserialize(datum);
}
exports.deserialize = deserialize;
function deserializeInstance(instance, resource, payload, includeDirective) {
    if (includeDirective === void 0) { includeDirective = {}; }
    var deserializer = new Deserializer(payload);
    return deserializer.deserializeInstance(instance, resource, includeDirective);
}
exports.deserializeInstance = deserializeInstance;
var Deserializer = /** @class */ (function () {
    function Deserializer(payload) {
        this._deserialized = [];
        this._resources = [];
        this.payload = payload;
        this.addResources(payload.data);
        this.addResources(payload.included);
    }
    Deserializer.prototype.addResources = function (data) {
        if (!data)
            return;
        if (Array.isArray(data)) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var datum = data_1[_i];
                this._resources.push(datum);
            }
        }
        else {
            this._resources.push(data);
        }
    };
    Deserializer.prototype.instanceFor = function (type) {
        var klass = configuration_1.default.modelForType(type);
        return new klass();
    };
    Deserializer.prototype.relationshipInstanceFor = function (datum, records) {
        var record = records.find(function (r) {
            return r.klass.jsonapiType === datum.type &&
                (r.id && datum.id && r.id === datum.id || r.temp_id && datum['temp-id'] && r.temp_id === datum['temp-id']);
        });
        if (!record) {
            record = this.instanceFor(datum.type);
        }
        return record;
    };
    // todo null temp id
    Deserializer.prototype.lookupAssociated = function (recordSet, record) {
        return recordSet.find(function (r) {
            return r.klass.jsonapiType === record.klass.jsonapiType &&
                (r.temp_id && record.temp_id && r.temp_id === record.temp_id || r.id && record.id && r.id === record.id);
        });
    };
    Deserializer.prototype.pushRelation = function (model, associationName, record) {
        var associationRecords = model[associationName];
        var existingInstance = this.lookupAssociated(associationRecords, record);
        if (!existingInstance) {
            model[associationName].push(record);
        }
    };
    Deserializer.prototype.deserialize = function (datum) {
        var instance = this.instanceFor(datum.type);
        return this.deserializeInstance(instance, datum, {});
    };
    Deserializer.prototype.deserializeInstance = function (instance, datum, includeDirective) {
        if (includeDirective === void 0) { includeDirective = {}; }
        var existing = this.alreadyDeserialized(datum);
        if (existing)
            return existing;
        // assign ids
        instance.id = datum.id;
        instance.temp_id = datum['temp-id'];
        // assign attrs
        instance.assignAttributes(datum.attributes);
        // assign meta
        instance.__meta__ = datum.meta;
        // so we don't double-process the same thing
        // must push before relationships
        this._deserialized.push(instance);
        this._processRelationships(instance, datum.relationships, includeDirective);
        // remove objects marked for destruction
        this._removeDeletions(instance, includeDirective);
        // came from server, must be persisted
        instance.isPersisted(true);
        return instance;
    };
    Deserializer.prototype._removeDeletions = function (model, includeDirective) {
        var _this = this;
        Object.keys(includeDirective).forEach(function (key) {
            var relatedObjects = model[key];
            if (relatedObjects) {
                if (Array.isArray(relatedObjects)) {
                    relatedObjects.forEach(function (relatedObject, index) {
                        if (relatedObject.isMarkedForDestruction() || relatedObject.isMarkedForDisassociation()) {
                            model[key].splice(index, 1);
                        }
                        else {
                            _this._removeDeletions(relatedObject, includeDirective[key] || {});
                        }
                    });
                }
                else {
                    var relatedObject = relatedObjects;
                    if (relatedObject.isMarkedForDestruction() || relatedObject.isMarkedForDisassociation()) {
                        model[key] = null;
                    }
                    else {
                        _this._removeDeletions(relatedObject, includeDirective[key] || {});
                    }
                }
            }
        });
    };
    Deserializer.prototype._processRelationships = function (instance, relationships, includeDirective) {
        var _this = this;
        this._iterateValidRelationships(instance, relationships, function (relationName, relationData) {
            var nestedIncludeDirective = includeDirective[relationName];
            if (Array.isArray(relationData)) {
                for (var _i = 0, relationData_1 = relationData; _i < relationData_1.length; _i++) {
                    var datum = relationData_1[_i];
                    var hydratedDatum = _this.findResource(datum);
                    var associationRecords = instance[relationName];
                    var relatedInstance = _this.relationshipInstanceFor(hydratedDatum, associationRecords);
                    relatedInstance = _this.deserializeInstance(relatedInstance, hydratedDatum, nestedIncludeDirective);
                    _this.pushRelation(instance, relationName, relatedInstance);
                }
            }
            else {
                var hydratedDatum = _this.findResource(relationData);
                var existing = instance[relationName];
                var associated = existing || _this.instanceFor(hydratedDatum.type);
                associated = _this.deserializeInstance(associated, hydratedDatum, nestedIncludeDirective);
                if (!existing) {
                    instance[relationName] = associated;
                }
            }
        });
    };
    Deserializer.prototype._iterateValidRelationships = function (instance, relationships, callback) {
        for (var key in relationships) {
            var relationName = key;
            if (instance.klass.camelizeKeys) {
                relationName = string_1.camelize(key);
            }
            if (instance.klass.attributeList[relationName]) {
                var relationData = relationships[key].data;
                if (!relationData)
                    continue; // only links, empty, etc
                callback(relationName, relationData);
            }
        }
    };
    Deserializer.prototype.alreadyDeserialized = function (resourceIdentifier) {
        return this._deserialized.find(function (m) {
            return m.klass.jsonapiType === resourceIdentifier.type &&
                (m.id && resourceIdentifier.id && m.id === resourceIdentifier.id || m.temp_id && resourceIdentifier.temp_id && m.temp_id === resourceIdentifier['temp-id']);
        });
    };
    Deserializer.prototype.findResource = function (resourceIdentifier) {
        var found = this._resources.find(function (r) {
            return r.type === resourceIdentifier.type &&
                (r.id && resourceIdentifier.id && r.id === resourceIdentifier.id || r['temp-id'] && resourceIdentifier['temp-id'] && r['temp-id'] === resourceIdentifier['temp-id']);
        });
        return found || resourceIdentifier;
    };
    return Deserializer;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzZXJpYWxpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9kZXNlcmlhbGl6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0NBQStDOztBQUUvQyxrREFBc0M7QUFFdEMsbUNBQW9DO0FBRXBDLHFCQUFxQixLQUFvQixFQUFFLE9BQWdCO0lBQ3pELElBQUksWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUF1TFEsa0NBQVc7QUFyTHBCLDZCQUE2QixRQUFlLEVBQUUsUUFBdUIsRUFBRSxPQUFnQixFQUFFLGdCQUE2QjtJQUE3QixpQ0FBQSxFQUFBLHFCQUE2QjtJQUNwSCxJQUFJLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBa0xxQixrREFBbUI7QUFoTHpDO0lBS0Usc0JBQVksT0FBTztRQUpuQixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNuQixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBSWQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELG1DQUFZLEdBQVosVUFBYSxJQUFJO1FBQ2YsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUM7UUFFbEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FB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
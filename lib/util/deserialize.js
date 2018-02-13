"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deserialize = function (registry, datum, payload) {
    var deserializer = new Deserializer(registry, payload);
    return deserializer.deserialize(datum);
};
exports.deserialize = deserialize;
var deserializeInstance = function (instance, resource, payload, includeDirective) {
    if (includeDirective === void 0) { includeDirective = {}; }
    var deserializer = new Deserializer(instance.klass.typeRegistry, payload);
    return deserializer.deserializeInstance(instance, resource, includeDirective);
};
exports.deserializeInstance = deserializeInstance;
var Deserializer = /** @class */ (function () {
    function Deserializer(registry, payload) {
        this._deserialized = [];
        this._resources = [];
        this.registry = registry;
        this.payload = payload;
        this.addResources(payload.data);
        this.addResources(payload.included);
    }
    Deserializer.prototype.addResources = function (data) {
        if (!data) {
            return;
        }
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
        var klass = this.registry.get(type);
        if (!klass) {
            throw new Error("Unknown type \"" + type + "\"");
        }
        return new klass();
    };
    Deserializer.prototype.relationshipInstanceFor = function (datum, records) {
        var record = records.find(function (r) {
            return !!(r.klass.jsonapiType === datum.type &&
                ((r.id && datum.id && r.id === datum.id) ||
                    (r.temp_id && datum["temp-id"] && r.temp_id === datum["temp-id"])));
        });
        if (!record) {
            record = this.instanceFor(datum.type);
        }
        return record;
    };
    // todo null temp id
    Deserializer.prototype.lookupAssociated = function (recordSet, record) {
        return recordSet.find(function (r) {
            return !!(r.klass.jsonapiType === record.klass.jsonapiType &&
                ((r.temp_id && record.temp_id && r.temp_id === record.temp_id) ||
                    (r.id && record.id && r.id === record.id)));
        });
    };
    Deserializer.prototype.pushRelation = function (model, associationName, record) {
        var modelIdx = model;
        var associationRecords = modelIdx[associationName];
        var existingInstance = this.lookupAssociated(associationRecords, record);
        if (!existingInstance) {
            modelIdx[associationName].push(record);
        }
    };
    Deserializer.prototype.deserialize = function (datum) {
        var instance = this.instanceFor(datum.type);
        return this.deserializeInstance(instance, datum, {});
    };
    Deserializer.prototype.deserializeInstance = function (instance, datum, includeDirective) {
        if (includeDirective === void 0) { includeDirective = {}; }
        var existing = this.alreadyDeserialized(datum);
        if (existing) {
            return existing;
        }
        // assign ids
        instance.id = datum.id;
        instance.temp_id = datum["temp-id"];
        // assign attrs
        instance.assignAttributes(datum.attributes);
        // assign meta
        instance.setMeta(datum.meta);
        // so we don't double-process the same thing
        // must push before relationships
        this._deserialized.push(instance);
        this._processRelationships(instance, datum.relationships || {}, includeDirective);
        // remove objects marked for destruction
        this._removeDeletions(instance, includeDirective);
        // came from server, must be persisted
        instance.isPersisted = true;
        instance.reset();
        return instance;
    };
    Deserializer.prototype._removeDeletions = function (model, includeDirective) {
        var _this = this;
        Object.keys(includeDirective).forEach(function (key) {
            var modelIdx = model;
            var relatedObjects = modelIdx[key];
            if (relatedObjects) {
                if (Array.isArray(relatedObjects)) {
                    relatedObjects.forEach(function (relatedObject, index) {
                        if (relatedObject.isMarkedForDestruction) {
                            modelIdx.klass.store.destroy(relatedObject);
                        }
                        else if (relatedObject.isMarkedForDisassociation) {
                            modelIdx[key].splice(index, 1);
                        }
                        else {
                            _this._removeDeletions(relatedObject, includeDirective[key] || {});
                        }
                    });
                }
                else {
                    var relatedObject = relatedObjects;
                    if (relatedObject.isMarkedForDestruction) {
                        modelIdx.klass.store.destroy(relatedObject);
                    }
                    else if (relatedObject.isMarkedForDisassociation) {
                        modelIdx[key] = null;
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
            var instanceIdx = instance;
            if (Array.isArray(relationData)) {
                for (var _i = 0, relationData_1 = relationData; _i < relationData_1.length; _i++) {
                    var datum = relationData_1[_i];
                    var hydratedDatum = _this.findResource(datum);
                    var associationRecords = instanceIdx[relationName];
                    var relatedInstance = _this.relationshipInstanceFor(hydratedDatum, associationRecords);
                    relatedInstance = _this.deserializeInstance(relatedInstance, hydratedDatum, nestedIncludeDirective);
                    _this.pushRelation(instance, relationName, relatedInstance);
                }
            }
            else {
                var hydratedDatum = _this.findResource(relationData);
                var existing = instanceIdx[relationName];
                var associated = existing || _this.instanceFor(hydratedDatum.type);
                associated = _this.deserializeInstance(associated, hydratedDatum, nestedIncludeDirective);
                if (!existing) {
                    instanceIdx[relationName] = associated;
                }
            }
        });
    };
    Deserializer.prototype._iterateValidRelationships = function (instance, relationships, callback) {
        for (var key in relationships) {
            if (relationships.hasOwnProperty(key)) {
                var relationName = instance.klass.deserializeKey(key);
                if (instance.klass.attributeList[relationName]) {
                    var relationData = relationships[key].data;
                    if (!relationData) {
                        continue;
                    } // only links, empty, etc
                    callback(relationName, relationData);
                }
            }
        }
    };
    Deserializer.prototype.alreadyDeserialized = function (resourceIdentifier) {
        return this._deserialized.find(function (m) {
            return !!(m.klass.jsonapiType === resourceIdentifier.type &&
                ((m.id && resourceIdentifier.id && m.id === resourceIdentifier.id) ||
                    (m.temp_id &&
                        resourceIdentifier.temp_id &&
                        m.temp_id === resourceIdentifier["temp-id"])));
        });
    };
    Deserializer.prototype.findResource = function (resourceIdentifier) {
        var found = this._resources.find(function (r) {
            return !!(r.type === resourceIdentifier.type &&
                ((r.id && resourceIdentifier.id && r.id === resourceIdentifier.id) ||
                    (r["temp-id"] &&
                        resourceIdentifier["temp-id"] &&
                        r["temp-id"] === resourceIdentifier["temp-id"])));
        });
        return found || resourceIdentifier;
    };
    return Deserializer;
}());
//# sourceMappingURL=deserialize.js.map
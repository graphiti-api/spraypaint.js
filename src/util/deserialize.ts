/// <reference path="../../types/index.d.ts" />

import Config from '../configuration';
import Model from '../model';
import { camelize } from './string';

function deserialize(datum : japiResource, payload: japiDoc) : Model {
  let deserializer = new Deserializer(payload);
  return deserializer.deserialize(datum);
}

function deserializeInstance(instance: Model, resource : japiResource, payload: japiDoc, includeDirective: Object = {}) : Model {
  let deserializer = new Deserializer(payload);
  return deserializer.deserializeInstance(instance, resource, includeDirective);
}

class Deserializer {
  _deserialized = [];
  _resources = [];
  payload: japiDoc;

  constructor(payload) {
    this.payload = payload;

    this.addResources(payload.data);
    this.addResources(payload.included);
  }

  addResources(data) {
    if (!data) return;

    if (Array.isArray(data)) {
      for (let datum of data) {
        this._resources.push(datum);
      }
    } else {
      this._resources.push(data);
    }
  }

  instanceFor(type: string) : Model {
    let klass = Config.modelForType(type);
    return new klass();
  }

  relationshipInstanceFor(datum: japiResource, records: Array<Model>) : Model {
    let record = records.find((r) => {
      return r.klass.jsonapiType === datum.type &&
        (r.id && datum.id && r.id === datum.id || r.temp_id && datum['temp-id'] && r.temp_id === datum['temp-id']);
    });

    if (!record) {
      record = this.instanceFor(datum.type);
    }

    return record;
  }

  // todo null temp id
  lookupAssociated(recordSet: Array<Model>, record: Model) {
    return recordSet.find((r) => {
      return r.klass.jsonapiType === record.klass.jsonapiType &&
        (r.temp_id && record.temp_id && r.temp_id === record.temp_id || r.id && record.id && r.id === record.id)
    });
  }

  pushRelation(model: Model, associationName: string, record: Model) : void {
    let associationRecords = model[associationName];
    let existingInstance = this.lookupAssociated(associationRecords, record);

    if (!existingInstance) {
      model[associationName].push(record);
    }
  }

  deserialize(datum: japiResource) : Model {
    let instance = this.instanceFor(datum.type);
    return this.deserializeInstance(instance, datum, {});
  }

  deserializeInstance(instance: Model, datum: japiResource, includeDirective: Object = {}) : Model {
    let existing = this.alreadyDeserialized(datum);
    if (existing) return existing;

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
  }

  _removeDeletions(model: Model, includeDirective: Object) {
    Object.keys(includeDirective).forEach((key) => {
      let relatedObjects = model[key];
      if (relatedObjects) {
        if (Array.isArray(relatedObjects)) {
          relatedObjects.forEach((relatedObject, index) => {
            if (relatedObject.isMarkedForDestruction()) {
              model[key].splice(index, 1);
            } else {
              this._removeDeletions(relatedObject, includeDirective[key] || {});
            }
          });
        } else {
          let relatedObject = relatedObjects;
          if (relatedObject.isMarkedForDestruction()) {
            model[key] = null;
          } else {
            this._removeDeletions(relatedObject, includeDirective[key] || {});
          }
        }
      }
    });
  }

  _processRelationships(instance, relationships, includeDirective) {
    this._iterateValidRelationships(instance, relationships, (relationName, relationData) => {
      let nestedIncludeDirective = includeDirective[relationName];

      if (Array.isArray(relationData)) {
        for (let datum of relationData) {
          let hydratedDatum = this.findResource(datum);
          let associationRecords = instance[relationName];
          let relatedInstance = this.relationshipInstanceFor(hydratedDatum, associationRecords);
          relatedInstance = this.deserializeInstance(relatedInstance, hydratedDatum, nestedIncludeDirective);

          this.pushRelation(instance, relationName, relatedInstance);
        }
      } else {
        let hydratedDatum = this.findResource(relationData);
        let existing = instance[relationName];
        let associated = existing || this.instanceFor(hydratedDatum.type);
        this.deserializeInstance(associated, hydratedDatum, nestedIncludeDirective);

        if (!existing) {
          instance[relationName] = associated;
        }
      }
    });
  }

  _iterateValidRelationships(instance, relationships, callback) {
    for (let key in relationships) {
      let relationName = camelize(key);
      if (instance.klass.attributeList.indexOf(relationName) >= 0) {
        let relationData = relationships[key].data;
        if(!relationData) continue; // only links, empty, etc
        callback(relationName, relationData);
      }
    }
  }

  alreadyDeserialized(resourceIdentifier) {
    return this._deserialized.find((m) => {
      return m.klass.jsonapiType === resourceIdentifier.type &&
        (m.id && resourceIdentifier.id && m.id === resourceIdentifier.id || m.temp_id && resourceIdentifier.temp_id && m.temp_id === resourceIdentifier['temp-id']);
    });
  }

  findResource(resourceIdentifier) {
    let found = this._resources.find((r) => {
      return r.type === resourceIdentifier.type &&
        (r.id && resourceIdentifier.id && r.id === resourceIdentifier.id || r['temp-id'] && resourceIdentifier['temp-id'] && r['temp-id'] === resourceIdentifier['temp-id']);
    });

    return found || resourceIdentifier;
  }
}

export { deserialize, deserializeInstance };

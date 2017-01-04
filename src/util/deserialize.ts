/// <reference path="../../index.d.ts" />

import Config from '../configuration';
import Model from '../model';
import { camelize } from './string';

export default function deserialize(resource : japiResource, payload: japiDoc) : Model {
  let deserializer = new Deserializer(payload);
  return deserializer.deserialize(resource);
}

class Deserializer {
  _models = [];
  _resources = [];
  payload: japiDoc;

  constructor(payload) {
    this.payload = payload;
    this.addResources(payload.data);
    this.addResources(payload.included);
  }

  addResources(data) {
    if (Array.isArray(data)) {
      for (let datum of data) {
        this._resources.push(datum);
      }
    } else {
      this._resources.push(data);
    }
  }

  deserialize(resource: japiResource, isRelation?: boolean) : Model {
    let record = this.findModel(resource);
    if (!record) {
      if (isRelation) {
        let hydrated = this.findResource(resource);
        if (hydrated) resource = hydrated;
      }
      record = this._deserialize(resource);
    }

    return record;
  }

  _deserialize(resource: japiResource) : Model {
    let klass = Config.modelForType(resource.type);
    let instance = new klass({ id: resource.id });
    this._models.push(instance);

    instance.attributes = resource.attributes;
    this._processRelationships(instance, resource.relationships);
    instance.__meta__ = resource.meta;
    return instance;
  }

  _processRelationships(instance, relationships) {
    this._iterateValidRelationships(instance, relationships, (relationName, relationData) => {
      if (Array.isArray(relationData)) {
        for (let datum of relationData) {
          let relatedRecord = this.deserialize(datum, true);
          instance[relationName].push(relatedRecord);
        }
      } else {
        let relatedRecord = this.deserialize(relationData, true);
        instance[relationName] = relatedRecord;
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

  findModel(resourceIdentifier) {
    return this._models.filter((m) => {
      return m.id == resourceIdentifier.id && m.klass.jsonapiType == resourceIdentifier.type;
    })[0];
  }

  findResource(resourceIdentifier) {
    return this._resources.filter((r) => {
      return r.id == resourceIdentifier.id && r.type == resourceIdentifier.type;
    })[0];
  }
}
